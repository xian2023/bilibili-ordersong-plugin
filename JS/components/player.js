import { config } from "./config.js";
import { musicMethod } from "../public/method.js";
import { musicServer, qqmusicServer } from "../apiServer/musicServer.js";

/* 播放器对象 */
export const player = {
    //  音频对象
    audio: null,
    
    // 页面元素
    elem: null,

    // 用户点歌队列
    orderList: [],

    // 空闲歌单列表 
    freeList: [],
    
    // 播放错误的次数
    playErrorCount: 0,

    // 空闲歌单列表的播放索引
    freeIndex: 0, 

    // 随机队列，防止随机重复
    randomList: [],

    // 歌曲播放时音量淡入，降低卡顿影响
    playFadeIn: null,

    // 添加点歌对象
    addOrder: function(order){
        // 添加点歌信息到点歌列表中
        this.orderList.push(order);
        // 页面同步添加
        var tr = document.createElement('tr');
        tr.innerHTML = `<td>${order.song.sname}</td>
            <td>${order.song.sartist}</td>
            <td>${order.uname}</td></td>`
        this.elem.appendChild(tr);
    },
    // 播放歌曲
    play: async function(song){
        // 检查播放器初始化
        if(!player.audio){
            musicMethod.pageAlert("播放器未初始化!");
            return;
        }
        // 根据歌曲信息，获取歌曲链接
        let url = null;
        if(song.platform && song.platform == "qq"){
            url = song.url;
            // url = await qqmusicServer.getSongUrl(song.sid);
        }else{
            url = await musicServer.getSongUrl(song.sid);
        }
        // 检查歌曲链接
        if(!url){            
            // 若多首歌链接都获取失败，可能服务器问题，停止请求
            if(this.playErrorCount++ > 5){
                setInterval(function(){
                    musicMethod.pageAlert("多次播放失败，请确认服务器状态!");
                }, 7000);
                return;
            }
            musicMethod.pageAlert("歌曲链接被吃掉了(>_<) =>" + this.playErrorCount++);
            setTimeout(() => {
                // 播放下一首歌曲
                this.playNext();
            }, 3000);
            return;
        }
        /* 可能浏览器插件会导致 audio.src = null 后src并不等于null */
        this.audio.src = url;

        /*----------------------------音量淡入-------------------------------*/
        if(this.playFadeIn){
            clearInterval(this.playFadeIn);
            this.playFadeIn = null;
        }
        this.audio.volume = 0;
        this.playFadeIn = setInterval(function(){
            /* 
                此处有两个注意点
                1. 此处若自增 0.1 会出现精度问题，0.1 + 0.2 不等于 0.3
                2. setInterval为全局函数，无法使用 this 指定对象
                */
            player.audio.volume = (player.audio.volume * 10 + 1) / 10;
            if(player.audio.volume == 1){
                clearInterval(player.playFadeIn);
                player.playFadeIn = null;
            }
        }, 300);
        /*----------------------------音量淡入-------------------------------*/
        
        // 播放
        this.audio.play();
    },
    // 播放下一首
    playNext:async function(){
        if(this.orderList.length > 0){
            // 若点歌列表存在歌曲，则删除第一首
            this.orderList.shift();
            this.elem.firstElementChild.remove();
            
        }
        if(!this.orderList.length){
            // 若点歌列表没有歌曲，则随机播放空闲歌单的歌曲
            if(!this.freeList.length){
                // musicMethod.pageAlert("没有下一首可以放了>_<!");
                // 没有就去获取私人fm
                let songList = await musicServer.getPersonalFM();
                if(!songList.length){
                    // musicMethod.pageAlert("获取失败!");
                    return;
                }
                this.freeList = songList;
            }
            this.addOrder(this.freeList.shift());
        }
        
        // 播放当前第一首歌曲
        this.play(this.orderList[0].song)
    },
    // 初始化播放器
    init: function(){
        // 创建音频对象
        this.audio = new Audio();  
        // 绑定页面元素
        this.elem = document.getElementById('songList');

        // 1. 开始播放事件
        this.audio.addEventListener("play", () => {
            let dot = document.getElementsByClassName('dot')[0]; 
            // 设置闪烁动画
            if (!dot.classList.contains("dot_blink")) {
                dot.classList.add("dot_blink");
            }
        });
        // 2. 暂停播放事件
        this.audio.addEventListener("pause", () => {
            let dot = document.getElementsByClassName('dot')[0]; 
            // 设置闪烁动画
            if (!dot.classList.contains("dot_blink")) {
                dot.classList.remove("dot_blink");
            }
        });
        // 3. 播放时间更新事件
        this.audio.addEventListener("timeupdate", () => {
            let progress = document.getElementsByClassName('progress_bar')[0];
            // 页面进度条实时修改
            progress.style.width = ((this.audio.currentTime / this.audio.duration) * 280) + "px";
            // 超过歌曲限长则自动播放下一首
            if (config.overLimit > 0 && this.audio.currentTime > config.overLimit) {
                this.playNext();
            }
        });
        // 4. 播放结束事件
        this.audio.addEventListener("ended", () => {  
            // 播放下一首歌曲
            this.playNext();
        });
        // 5. 播放失败事件
        this.audio.addEventListener("error", () => {
            musicMethod.pageAlert("播放错误，即将播放下一首 =>" + this.playErrorCount++);
            // 播放下一首歌曲
            this.playNext();         
        });
        musicMethod.pageAlert("已初始化播放器!");
    }
}

window.player = player;
