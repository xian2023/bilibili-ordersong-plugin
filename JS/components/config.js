import { player } from "./player.js";
import { musicMethod } from "../public/method.js";
import { musicServer, qqmusicServer } from "../apiServer/musicServer.js";


/* 配置对象 */
export const config = {
    
    // 主播id（用于切歌命令的最高权限者）
    adminId: 1568568,
    // 我想要随意切歌
    adminId2: 1568568,
    // 最近添加的管理员ID
    newAddAdminId: 0,
    // 管理员列表
    adminList: [],

    // 用户点歌数量限制
    userOrder: 3,
    
    // 最大点歌数限制
    maxOrder: 15,

    // 限制点歌歌曲的时长(单位秒), 超过则无法点上所点歌曲
    maxDuration: 0,

    // 限制歌曲播放的时长(单位秒)，超过则自动播放下一首歌曲
    overLimit: 0,
    
    // 空闲歌单ID (登录网易云网站，获取歌单页面url结尾ID)
    // songListId: 7294328248, 
    
    // 空闲歌单列表
    // freeSongList: [],

    // 历史点歌用户
    userHistory: [],

    // 历史点歌歌曲
    songHistory: [],

    // 用户黑名单
    userBlackList: [],
    
    // 歌曲黑名单
    songBlackList: [],

    // 用户登录的cookie
    cookie: "",

    // 加载空闲歌单
    // loadSongList: async function(listId){
    //     if(!listId){
    //         musicMethod.pageAlert("歌单Id无效!");
    //         return;
    //     }

    //     // 获取新的歌单
    //     let songList = await musicServer.getSongList(listId);
    //     if(!songList.length){
    //         musicMethod.pageAlert("歌单列表获取失败!");
    //         return false;
    //     }
    //     player.freeList = songList;
        
    //     document.getElementById('songListId').value = listId;
    //     // 获取歌单成功后保存配置项
    //     this.songListId = listId;
    //     localStorage.setItem("songListId", this.songListId);
    //     // 添加歌单到历史记录中
    //     this.addSongListHistory(listId);
    //     // 加载完成后自动播放下一首
    //     player.playNext();
    //     musicMethod.pageAlert("已获取空闲歌单列表!");
    // },

    // 添加管理员ID到白名单
    addAdminHistory: function(adminId){
        // 查重
        if(this.adminList.indexOf(adminId) != -1){
            return;
        }
        // 限长，按队列结构出队（防止无限占用内存）
        if(this.userHistory.length > 50){
            this.userHistory.shift();
        }
        this.newAddAdminId= adminId;
        this.adminList.push(adminId);
        // 同步页面的历史用户下拉框
        let elem_adminListHistory = document.getElementById('adminList');
        let elem_option = document.createElement('option');
        elem_option.value = adminId;
        elem_option.textContent = adminId;
        elem_adminListHistory.appendChild(elem_option);

        // 保存配置信息
        localStorage.setItem("adminList", JSON.stringify(this.adminList));

    },
    // 移除管理员ID从白名单
    removeAdminHistory: function(adminId){
        // 查找adminId在数组中的位置
        let index = this.adminList.indexOf(adminId);
        // 如果存在，则进行移除操作
        if(index !== -1){
            // 从adminList数组中移除
            this.adminList.splice(index, 1);
            // 同步移除页面的历史用户下拉框中的选项
            let elem_adminListHistory = document.getElementById('adminList');
            let options = elem_adminListHistory.options;
            for(let i = 0; i < options.length; i++){
                if(options[i].value == adminId){
                    elem_adminListHistory.remove(i);
                    break;
                }
            }
            // 保存配置信息
            localStorage.setItem("adminList", JSON.stringify(this.adminList));
        }
    },
    
    // 添加历史点歌用户
    addUserHistory: function(user){
        // 查重
        for (let i = 0; i < this.userHistory.length; i++) {
            if(this.userHistory[i].uid == user.uid){
                return;
            }
        }
        // 限长，按队列结构出队（防止无限占用内存）
        if(this.userHistory.length > 50){
            this.userHistory.shift();
        }
        // 添加用户信息
        this.userHistory.push(user);
        // 同步页面的历史用户下拉框
        let elem_userHistory = document.getElementById('userHistory');
        let elem_option = document.createElement('option');
        elem_option.value = user.uid;
        elem_option.textContent = user.uname;
        elem_userHistory.appendChild(elem_option);
        
        // 保存到本地
        localStorage.setItem("userHistory", JSON.stringify(this.userHistory));
    },
    // 添加历史点歌歌曲
    addSongHistory: function(song){
        for (let i = 0; i < songHistory.length; i++) {
            if(songHistory[i].sid == song.sid){
                return;
            }
        }
        // 限长，按队列结构出队（防止无限占用内存）
        if(this.songHistory.length > 50){
            this.songHistory.shift();
        }
        // 添加歌曲信息
        this.songHistory.push(song);
        // 同步页面的历史歌曲下拉框
        let elem_songHistory = document.getElementById('songHistory');
        let elem_option = document.createElement('option');
        elem_option.value = song.sid;
        elem_option.textContent = song.sname;
        elem_songHistory.appendChild(elem_option);

        // 保存到本地
        localStorage.setItem("songHistory", JSON.stringify(this.songHistory));
    },
    // 添加用户黑名单
    addUserBlackList: function(user){
        // 查重
        for (let i = 0; i < this.userBlackList.length; i++) {
            if(this.userBlackList[i].uid == user.uid){
                musicMethod.pageAlert("用户已加入黑名单, 请勿重复添加!");
                return;
            }
        }
        // 限长，按队列结构出队（防止无限占用内存）
        if(this.userBlackList.length > 50){
            this.userBlackList.shift();
        }
        // 用户黑名单添加用户
        this.userBlackList.push(user);
        // 页面用户黑名单列表添加用户
        let elem_userBlackList = document.getElementById('userBlackList');
        let elem_option = document.createElement('option');
        elem_option.value = user.uid;
        elem_option.textContent = user.uname;
        elem_userBlackList.appendChild(elem_option);

        // 保存到本地
        localStorage.setItem("userBlackList", JSON.stringify(this.userBlackList));
    },
    // 添加歌曲黑名单 
    addSongBlackList: function(song){
        // 查重
        for (let i = 0; i < this.songBlackList.length; i++) {
            if(this.songBlackList[i].sid == song.sid){
                musicMethod.pageAlert("歌曲已加入黑名单, 请勿重复添加!");
                return;
            }
        }
        // 限长，按队列结构出队（防止无限占用内存）
        if(this.songBlackList.length > 50){
            this.songBlackList.shift();
        }
        // 歌曲黑名单添加歌曲
        this.songBlackList.push(song);
        // 页面歌曲黑名单列表添加歌曲
        let elem_songBlackList = document.getElementById('songBlackList');
        let elem_option = document.createElement('option');
        elem_option.value = song.sid;
        elem_option.textContent = song.sname;
        elem_songBlackList.appendChild(elem_option);

        // 保存到本地
        localStorage.setItem("songBlackList", JSON.stringify(this.songBlackList));
    },
    // 检查点歌信息
    checkOrder: function(order){
        // 查询用户是否被拉入黑名单
        for (let i = 0; i < this.userBlackList.length; i++) {
            if(this.userBlackList[i].uid == order.uid){
                this.pageAlert("你已被加入暗杀名单!(▼へ▼メ)!");
                return false;
            }
        }
        // 用户点歌数是否已达上限
        // if(player.orderList.filter(value => value.uid == order.uid).length >= this.userOrder){
        //     this.pageAlert("你点太多啦，歇歇吧>_<!");
        //     return false;
        // }
        // 最大点歌数是否已达上限
        if(player.orderList.length >= this.maxOrder){
            this.pageAlert("我装不下更多的歌啦>_<!");
            return false;
        }
        
        // 查询歌曲是否被拉入黑名单
        for (let i = 0; i < this.songBlackList.length; i++) {
            if(this.songBlackList[i].sid == order.song.sid){
                this.pageAlert("请不要乱点奇怪的歌!(▼ヘ▼#)");
                return false;
            }
        }     
        
        // 判断该歌曲是否已在点歌列表
        if(player.orderList.some(value => value.song.sid == order.song.sid)){
            this.pageAlert("已经点上啦!>_<!");
            return false;
        }
        if(this.maxDuration > 0 && order.song.duration > this.maxDuration){
            // 该歌曲是否无歌曲限制，且歌曲时长超出规定,
            this.pageAlert("你点的歌时太长啦!>_<");
            return false
        }
        // 点歌成功，加入历史用户和历史歌曲列表中
        this.addUserHistory({
            uid: order.uid,
            uname: order.uname,
        })
        this.addSongHistory({
            sid: order.song.sid,
            sname: order.song.sname,
        })
        return true; 
    },
    
    // 初始化配置项和设置页面
    init: async function(){
        /* 一、初始化配置项 */
        // 1. 读取本地存储中的配置项
        for(const key in this){
            if(!localStorage.getItem(key)){
                continue;
            }
            if( typeof this[key] == "number"){
                this[key] = parseInt(localStorage.getItem(key));
            }else if (typeof this[key] == "string") {
                this[key] = localStorage.getItem(key);
            }else if(Array.isArray( this[key] )){
                this[key] = JSON.parse(localStorage.getItem(key));
            }
        }

        let loginAlert = null;
        
        // 2. 获取用户登录状态
        if(this.cookie && this.cookie != ""){ 
            // 获取登录的用户信息
            let loginStatus = await musicServer.loginStatus();
            if(loginStatus.code == 200){
                document.getElementById('qrInfo').value = "已登录";
                document.getElementById('qrLogin').textContent = "退出登录";
            }else{
                musicMethod.pageAlert("登录失败!");
            }
        }else{
            
            musicMethod.pageAlert("用户未登录, 可能无法播放歌曲!");
            
            // ------------待修改为游客登录--------
            // this.cookie = musicServer.anonimous();
        }

        // 3. 加载管理员列表到设置页面中
        let elem_adminList = document.getElementById('adminList');
        for(let i = 0; i < this.adminList.length; i++){
            let option = document.createElement('option');
            option.value = this.adminList[i];
            option.textContent = this.adminList[i];
            elem_adminList.appendChild(option);
        }
        
        // 4. 加载用户黑名单到设置页面中
        let elem_userBlackList = document.getElementById('userBlackList');
        for(let i = 0; i < this.userBlackList.length; i++){
            let option = document.createElement('option');
            option.value = this.userBlackList[i].uid;
            option.textContent = this.userBlackList[i].uname;
            elem_userBlackList.appendChild(option);
        }
        // 5. 加载歌曲黑名单到设置页面中
        let elem_songBlackList = document.getElementById('songBlackList');
        for(let i = 0; i < this.songBlackList.length; i++){
            let option = document.createElement('option');
            option.value = this.songBlackList[i].sid;
            option.textContent = this.songBlackList[i].sname;
            elem_songBlackList.appendChild(option);
        }

        // 6. 加载空闲歌单
        // this.loadSongList(this.songListId);


        /* 二、初始化设置界面操作 */
        // 1. 设置界面的显示与隐藏
        document.getElementById('setting').onclick = function(){
            let configPanel = document.getElementsByClassName('config')[0];
            let qrImg = document.getElementById('qrImg'); 
            if(configPanel.clientHeight < 1){
                configPanel.style.height = "400px";
            }else{
                configPanel.style.height = "0px";
                qrImg.style.display = "none";
            }
        }
        document.getElementById('next-song').onclick = function(){
            player.playNext();
        }  
        // 2. 设置实时修改部分配置项方法
        let keys = ["adminId", "userOrder", "maxOrder", "maxDuration", "overLimit"];
        for(let i = 0; i < keys.length; i++){
            let elem = document.getElementById(keys[i]);
            if(!elem) continue;
            elem.value = config[keys[i]];
            // 输入框失去焦点保存配置
            elem.addEventListener("blur", function(e){
                // 保存配置
                this[keys[i]] = parseInt(e.target.value);
                localStorage.setItem(keys[i], e.target.value);
            })
        }

        // 5. 网易二维码登录
        let qrCheck = null;
        document.getElementById('qrLogin').onclick = async (e) =>{
            if(!this.cookie || this.cookie == ""){
                // 二维码图片
                let qrImg = document.getElementById('qrImg'); 
                if(qrImg.style.display == "block"){
                    // 如果二维码已经显示，则隐藏并取消上一次轮询请求
                    clearInterval(qrCheck);
                    qrImg.style.display = "none";
                    return;
                }

                // 首先要获取二维码的key
                let unikey = await musicServer.getQrKey();
                // 用二维码key获取二维码图片
                let url = await musicServer.getQrPicture(unikey);
                // 显示二维码
                qrImg.style.display = "block";
                qrImg.setAttribute("src", url);
                
                // 轮询二维码状态
                qrCheck = setInterval(async () => {
                    let data = await musicServer.checkQrStatus(unikey);
                    if (!data) {
                        qrImg.style.display = "none";
                        musicMethod.pageAlert("请求失败!");
                        clearInterval(qrCheck);
                    }
                    if(data.code == 800){
                        // 二维码过期
                        qrImg.style.display = "none";
                        musicMethod.pageAlert("二维码已过期");
                        clearInterval(qrCheck);
                    }else if(data.code == 803){
                        // 授权成功
                        qrImg.style.display = "none";
                        // 保存cookie
                        this.cookie = data.cookie;
                        localStorage.setItem("cookie", this.cookie);
                        // 登录成功后重新加载空闲歌单
                        // this.loadSongList(this.songListId);
                        e.target.textContent = "退出登录";
                        document.getElementById('qrInfo').value = "已登录";
                        musicMethod.pageAlert("登录成功");
                        // 清除定时器
                        clearInterval(qrCheck);
                        clearInterval(loginAlert);
                    }
                }, 3000)

            }else{
                // 若当前存在cookie信息，则进行退出登录
                // 发送退出登录请求
                musicServer.logout();
                // 清空手机号
                // phone.value = "";
                // 删除本地cookie
                this.cookie = "";
                document.cookie = "";
                localStorage.removeItem("cookie");
                // 启用手机号验证码功能
                e.target.textContent = "二维码登录";
                document.getElementById('qrInfo').value = "请扫码登录";
                musicMethod.pageAlert("已退出登录!");
            }  
        };
        // 6. QQ音乐设置cookie（仅临时设置）
        document.getElementById('qSetCookie').onclick = async (e) =>{
            let qqcookie = document.getElementById('cookie')
            qqmusicServer.setCookie(qqcookie.value);
        };
        // 7. 添加管理员
        document.getElementById('addAdmin').onclick = (e) =>{
            let adminId = parseInt(document.getElementById('newAdminId').value);
            if(!adminId || this.newAddAdminId == adminId){
                
                // musicMethod.pageAlert("未修改歌单ID");
                return;
            }
            this.addAdminHistory(adminId);
        };
        // 8.移除管理员
        document.getElementById('removeAdmin').onclick = () =>{
            let elem_songListId = document.getElementById('adminList');
            let listId = parseInt(elem_songListId.value);
            this.removeAdminHistory(listId);
        }
        // 9. 添加用户到黑名单
        document.getElementById('addUserBlack').onclick = () =>{
            let elem_userHistory = document.getElementById('userHistory');
            if(elem_userHistory.children.length > 0){
                this.addUserBlackList(this.userHistory[elem_userHistory.selectedIndex]);
            }else{
                musicMethod.pageAlert("历史用户为空!");
            }
        };
        // 10. 添加歌曲到黑名单
        document.getElementById('addSongBlack').onclick = () =>{
            let elem_songHistory = document.getElementById('songHistory');
            if(elem_songHistory.children.length > 0){
                this.addSongBlackList(this.songHistory[elem_songHistory.selectedIndex]);
            }else{
                musicMethod.pageAlert("历史歌曲为空");
            }
        };
        // 11. 移除黑名单的用户
        document.getElementById('delUserBlack').onclick = () =>{
            if(elem_userBlackList.selectedIndex > -1){
                // 移除配置项中用户黑名单的对应用户
                this.userBlackList.splice(elem_userBlackList.selectedIndex, 1);
                // 移除页面中用户黑名单的选中用户
                userBlackList.options[elem_userBlackList.selectedIndex].remove();
                // 更新本地存储配置项
                localStorage.setItem("userBlackList", JSON.stringify(this.userBlackList));
            }else{
                musicMethod.pageAlert("移除失败，未选择移除用户");
            }
            
        };
        // 12. 移除黑名单的歌曲
        document.getElementById('delSongBlack').onclick = () =>{
            if(elem_songBlackList.selectedIndex > -1){
                // 移除配置项中歌曲黑名单对应的歌曲
                this.songBlackList.splice(elem_songBlackList.selectedIndex, 1);
                // 移除页面中歌曲黑名单的选中歌曲
                songBlackList.options[elem_songBlackList.selectedIndex].remove();
                // 更新本地存储配置项
                localStorage.setItem("songBlackList", JSON.stringify(this.songBlackList));

            }else{
                musicMethod.pageAlert("移除失败，未选择移除歌曲");
            }
        };

        musicMethod.pageAlert("已初始化配置项");
    }
}