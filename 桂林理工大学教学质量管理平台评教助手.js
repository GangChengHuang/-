// ==UserScript==
// @name         桂林理工大学教学质量管理平台评教助手
// @namespace    GCH
// @version      1.2
// @description  教学质量管理平台评教助手
// @author       Peterg
// @match        https://glut.mycospxk.com/index.html*
// @icon         https://glut.mycospxk.com/logo.ico
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @license      GPL3.0
// ==/UserScript==

(function () {

    var radio_num = GM_getValue("radio_num", "1");
    var check_nums = GM_getValue("check_nums", "");
    var blanks_text = GM_getValue("blanks_text", "努力");

    var global_flag_display = false;
    var global_radio_display = false;
    var global_checkbox_display = false;
    var global_textarea_display = false;
    var global_submit_button_display = false;

    // 创建悬浮窗
    function createFloatingWindow() {
        // 创建窗口容器
        var windowContainer = document.createElement('div');
        windowContainer.id = 'floating-window';
        windowContainer.innerHTML = `
            <div class="title-bar">
    <div class="title-bar-buttons">
        <button class="maximize-button"></button>
        <button class="minimize-button"></button>
        <button class="close-button"></button>
    </div>
    <div class="title-bar-text">桂林理工大学增强工具</div>
</div>
<p class="tips-text" id="text-tips"></p>
<div class="floating-window-content" id="div-floating-window">
    <div id="div-floating-window-radio">
        <p id="text-radio">单选:</p>
        <input class="floating-window-input" type="text" placeholder="输入第n选项的n,例如:1" id="input-text">
    </div>
    <div id="div-floating-window-checkbox">
        <p id="text-checkbox">多选:</p>
        <input class="floating-window-input" type="text" placeholder="例如:1 2(空格隔,*全选)" id="input-checkbox">
    </div>
    <div id="div-floating-window-textarea">
        <p id="text-textarea">填空:</p>
        <input class="floating-window-input" type="text" placeholder="例如:我会继续努力！" id="input-textarea">
    </div>
    <button class="floating-window-button" type="button" id="fill-button">一键填写</button>
    <button class="floating-window-button" type="button" id="random-fill-button">随机填写</button>
    <button class="floating-window-button" type="button" id="submit-button">一键提交</button>
</div>
        `;

        // 添加窗口容器到页面
        document.body.appendChild(windowContainer);

        // 获取窗口元素
        var floatingWindow = document.getElementById('floating-window');

        // 添加拖动功能
        var isDragging = false;
        var offsetX = 0;
        var offsetY = 0;

        var inputText = document.getElementById("input-text");
        var inputCheckbox = document.getElementById("input-checkbox");
        var inputTextarea = document.getElementById("input-textarea");

        inputText.value = radio_num;
        inputCheckbox.value = check_nums;
        inputTextarea.value = blanks_text;


        document.getElementById("fill-button").addEventListener("click", function () {
            var inputText = document.getElementById("input-text").value;
            var inputCheckbox = document.getElementById("input-checkbox").value;
            var inputTextarea = document.getElementById("input-textarea").value;
            if (global_radio_display) {
                radioOption(document.querySelectorAll('div.ant-radio-group'), ['input.ant-radio-input'], (parseInt(inputText) - 1));
            }
            if (global_checkbox_display) {
                CheckOptions(document.querySelectorAll('div.ant-radio-group'), ['input.ant-checkbox-input'], inputCheckbox != "*" ? ((" " + inputCheckbox).match(/[^\d]/g).map(function (value) {
                    return value - 1;
                })) : "*");
            }
            if (global_textarea_display) {
                fillInput(document, ['div.ant-card-body textarea.ant-input', 'div.ant-card-body input.ant-input'], inputTextarea);
            }
        });


        document.getElementById("submit-button").addEventListener("click", function () {
            getSubmitButton().click();
        });

        document.getElementById("random-fill-button").addEventListener("click", function () {
            var inputTextarea = document.getElementById("input-textarea").value;
            if (global_radio_display) {
                radioOption(document.querySelectorAll('div.ant-radio-group'), ['input.ant-radio-input'], "", true);
            }
            if (global_checkbox_display) {
                CheckOptions(document.querySelectorAll('div.ant-radio-group'), ['input.ant-checkbox-input'], "", true);
            }
            if (global_textarea_display) {
                fillInput(document, ['div.ant-card-body textarea.ant-input', 'div.ant-card-body input.ant-input'], inputTextarea);
            }
        });

        function handleMouseDown(event) {
            isDragging = true;
            offsetX = event.clientX - floatingWindow.offsetLeft;
            offsetY = event.clientY - floatingWindow.offsetTop;
        }

        function handleMouseUp() {
            isDragging = false;
        }

        function handleMouseMove(event) {
            if (isDragging) {
                floatingWindow.style.left = event.clientX - offsetX + 'px';
                floatingWindow.style.top = event.clientY - offsetY + 'px';
            }
        }

        floatingWindow.querySelector('.title-bar').addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);

        // 添加调整大小功能
        var isResizing = false;
        var originalWidth = floatingWindow.offsetWidth;
        var originalHeight = floatingWindow.offsetHeight;
        var resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';

        function handleResizeMouseDown(event) {
            isResizing = true;
            originalWidth = floatingWindow.offsetWidth;
            originalHeight = floatingWindow.offsetHeight;
            offsetX = event.clientX;
            offsetY = event.clientY;
        }

        function handleResizeMouseUp() {
            isResizing = false;
        }

        function handleResizeMouseMove(event) {
            if (isResizing) {
                var width = originalWidth + (event.clientX - offsetX);
                var height = originalHeight + (event.clientY - offsetY);
                floatingWindow.style.width = width + 'px';
                floatingWindow.style.height = height + 'px';
            }
        }

        resizeHandle.addEventListener('mousedown', handleResizeMouseDown);
        window.addEventListener('mouseup', handleResizeMouseUp);
        window.addEventListener('mousemove', handleResizeMouseMove);
        floatingWindow.appendChild(resizeHandle);

        // 添加最小化和关闭功能
        var minimizeButton = floatingWindow.querySelector('.minimize-button');
        var maximizeButton = floatingWindow.querySelector('.maximize-button');
        var closeButton = floatingWindow.querySelector('.close-button');

        function handleMinimizeClick() {
            floatingWindow.style.display = 'none';
            showMinimizedIcon();
        }

        function handleMaximizeClick() {
            floatingWindow.classList.toggle('maximized');
        }

        function handleCloseClick() {
            floatingWindow.remove();
            removeMinimizedIcon();
        }


        minimizeButton.addEventListener('click', handleMinimizeClick);
        maximizeButton.addEventListener('click', handleMaximizeClick);
        closeButton.addEventListener('click', handleCloseClick);

        // 添加最小化图标
        var minimizedIcon = document.createElement('div');
        minimizedIcon.id = 'minimized-icon';
        minimizedIcon.title = '打开悬浮窗';
        minimizedIcon.addEventListener('click', handleMinimizedIconClick);

        function showMinimizedIcon() {
            document.body.appendChild(minimizedIcon);
        }

        function removeMinimizedIcon() {
            minimizedIcon.remove();
        }

        function handleMinimizedIconClick() {
            floatingWindow.style.display = 'block';
            removeMinimizedIcon();
        }
    }

    function setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
        } else {
            valueSetter.call(element, value);
        }
    }

    function radioOption(my_document, js_path, option, random_flag = false) {
        GM_setValue("radio_num", (option + 1));
        for (var i = 0; i < my_document.length; i++) {
            let radioinput = my_document[i].querySelectorAll(js_path);
            if (random_flag) {
                option = parseInt(Math.random() * (radioinput.length - 1), 10);
                option = option > radioinput.length ? radioinput.length : option;
                radioinput[option].click();
            } else {
                for (var j = 0; j < radioinput.length; j++) {
                    option = option > radioinput.length ? radioinput.length : option;
                    option = option < 0 ? 0 : option;
                    radioinput[option].click();
                }
            }
        }
    }

    function CheckOptions(my_document, js_path, options, random_flag = false) {
        GM_setValue("check_nums", options.toString());
        let checkboxinput = my_document.querySelectorAll(js_path);
        for (var i = 0; i < checkboxinput.length; i++) {
            if (random_flag) {
                options = selectRandom(parseInt(Math.random() * (checkboxinput.length - 1), 10), 0, checkboxinput.length);
                for (var j = 0; j < options.length; j++) {
                    options[j] = options[j] > checkboxinput.length ? checkboxinput.length : options[j];
                    options[j] = options[j] < 0 ? 0 : options[j];
                    checkboxinput[options[j]].click();
                }
            } else {
                for (var k = 0; k < options.length; k++) {
                    if (options[0] == "*") {
                        checkboxinput[i].click();
                        continue;
                    }
                    options[k] = options[k] > checkboxinput.length ? checkboxinput.length : options[k];
                    options[k] = options[k] < 0 ? 0 : options[k];
                    checkboxinput[options[k]].click();
                }
            }
        }

    }

    function fillInput(my_document, js_path, input_text) {
        GM_setValue("blanks_text", input_text);
        for (var i = 0; i < js_path.length; i++) {
            let input = my_document.querySelectorAll(js_path[i]);
            for (var j = 0; j < input.length; j++) {
                setNativeValue(input[j], input_text);
                input[j].dispatchEvent(new Event('input', {
                    bubbles: true
                }));
            }
        }
    }

    function selectRandom(num, from, to) {
        let arr = [];
        let json = {};
        let needNum;

        if (from - to >= 0) {
            console.log(111)
            return '起始值要小于末尾值'
        }

        if (to - from == to) {
            needNum = parseInt(to) + 1;
        } else {
            needNum = to - from;
        }
        if (num > needNum) {
            return
        } else {
            while (arr.length < num) {
                let ranNum = Math.ceil(Math.random() * needNum);
                if (!json[ranNum]) {
                    json[ranNum] = 1;
                    arr.push(ranNum)
                }
            }
            return arr;
        }
    }

    function getSubmitButton() {
        if (document.querySelector("form > div > div > button") || document.querySelector("button.ant-btn > span")) {
            global_submit_button_display = true;
            return document.querySelector("form > div > div > button") ? document.querySelector("form > div > div > button") : document.querySelector("button.ant-btn > span")
        }
        global_submit_button_display = false;
        return null;
    }

    function updateWindowsMsgText() {
        var text_tips = document.getElementById("text-tips");
        var unread_num = document.querySelector("span.badge") ? document.querySelector("span.badge").textContent : null;
        var stu_name = document.querySelector("span.name") ? document.querySelector("span.name").textContent : null;
        if (document.querySelector("div > div > div > h1") || document.querySelector("div.ant-card > div > div > div")) {
            global_flag_display = true;
            var div_title = document.querySelector("div > div > div > h1") ? document.querySelector("div > div > div > h1") : document.querySelector("div.ant-card > div > div > div");
            text_tips.textContent = `当前在填写:《${div_title.textContent}》`;
        }
        else if (document.querySelector("#anonymous_answer > div > p")) {
            global_flag_display = true;
            var div_title = document.querySelector("#anonymous_answer > div > p");
            text_tips.textContent = `当前在填写:《${div_title.textContent}》`;
        }
        else {
            global_flag_display = false;
            if (unread_num) {
                text_tips.textContent = `Tips:${stu_name}\t你好!\t您有${unread_num}个事件未处理`;
            } else {
                text_tips.textContent = `Tips:${stu_name}\t你好!\t您已完成所有事件`;
            }
        }
    }

    function updateWindowsSubmitButton() {
        var submitButton = document.getElementById("submit-button");
        submitButton.textContent = getSubmitButton() ? getSubmitButton().textContent : "未找到提交按钮";
    }

    function updateWindowsText() {
        if (document.querySelectorAll("div.ant-radio-group")) {
            var radio_checked_num = document.querySelectorAll("span.ant-radio.ant-radio-checked").length;
            var radio_num = document.querySelectorAll("div.ant-radio-group").length;
            global_radio_display = radio_num > 0 ? true : false;
            var text_radio = document.getElementById("text-radio");
            text_radio.textContent = `有${radio_num}道单选\t已选${radio_checked_num}道`;
        } else {
            global_radio_display = false;
        }
        if (document.querySelectorAll("textarea.ant-input") || document.querySelectorAll("input.ant-input")) {
            var textarea_num = document.querySelectorAll("textarea.ant-input").length + document.querySelectorAll("input.ant-input").length;
            global_textarea_display = textarea_num > 0 ? true : false;
            var text_textarea = document.getElementById("text-textarea");
            text_textarea.textContent = `有${textarea_num}道填空`;
        } else {
            global_textarea_display = false;
        }
        if (document.querySelectorAll("div.ant-checkbox-group")) {
            var checkbox_num = document.querySelectorAll("div.ant-checkbox-group").length;
            global_checkbox_display = checkbox_num > 0 ? true : false;
            var text_checkbox = document.getElementById("text-checkbox");
            text_checkbox.textContent = `有${checkbox_num}道多选`;
        } else {
            global_checkbox_display = false;
        }

    }

    function updateWindowsDisplay() {
        var div_floating_window_style = document.getElementById("div-floating-window").style;
        var div_floating_window_radio_style = document.getElementById("div-floating-window-radio").style;
        var div_floating_window_checkbox_style = document.getElementById("div-floating-window-checkbox").style;
        var div_floating_window_textarea_style = document.getElementById("div-floating-window-textarea").style;
        var submit_button_style = document.getElementById("submit-button").style;
        global_flag_display ? div_floating_window_style.display = "block" : div_floating_window_style.display = "none";
        global_radio_display ? div_floating_window_radio_style.display = "block" : div_floating_window_radio_style.display = "none";
        global_checkbox_display ? div_floating_window_checkbox_style.display = "block" : div_floating_window_checkbox_style.display = "none";
        global_textarea_display ? div_floating_window_textarea_style.display = "block" : div_floating_window_textarea_style.display = "none";
        global_submit_button_display ? submit_button_style.display = "block" : submit_button_style.display = "none";
    }


    function pageMutation() {
        // 选择将观察突变的节点
        var targetNode = document.getElementById('root');

        // 观察者的选项(要观察哪些突变)
        var config = { attributes: true, childList: true, subtree: true };

        // 当观察到突变时执行的回调函数
        var callback = function (mutationsList) {
            mutationsList.forEach(function (item, index) {
                updateWindowsMsgText();
                updateWindowsSubmitButton();
                updateWindowsText();
                updateWindowsDisplay();
                console.log("变化");
            });
        };

        // 创建一个链接到回调函数的观察者实例
        var observer = new MutationObserver(callback);

        // 开始观察已配置突变的目标节点
        observer.observe(targetNode, config);
    }

    // 添加样式
    GM_addStyle(`
        #floating-window {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #f9f9f9;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
            width: 400px;
            min-height: 300px;
            overflow: hidden;
            z-index: 9999;
        }

        .title-bar {
            display: flex;
            align-items: center;
            background-color: #f9f9f9;
            height: 40px;
            padding: 0 16px;
            border-bottom: 1px solid #ccc;
        }

        .title-bar-text {
            flex-grow: 1;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
        }

        .title-bar-buttons {
            display: flex;
            align-items: center;
        }

        .tips-text {
            font-weight: bold;
            text-align: center;
        }

        .title-bar-buttons button {
            width: 14px;
            height: 14px;
            margin-left: 4px;
            border: none;
            border-radius: 50%;
            cursor: pointer;
        }

        .minimize-button {
            background-color: #ffb900;
        }

        .maximize-button {
            background-color: #ff3b30;
        }

        .close-button {
            background-color: #34c759;
        }

        .floating-window-content {
            padding: 16px;
        }

        .floating-window-input {
            display: block;
            margin-bottom: 8px;
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
            background-color: #f2f2f2;
            color: #333;
        }

        .floating-window-button {
            display: block;
            margin-bottom: 8px;
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
            background-color: #f2f2f2;
            color: #333;
        }

        .resize-handle {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 16px;
            height: 16px;
            background-color: #9e9e9e;
            cursor: nwse-resize;
        }

        #minimized-icon {
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 32px;
            height: 32px;
            background-color: #9e9e9e;
            border-radius: 50%;
            cursor: pointer;
        }

        #floating-window.maximized {
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: auto;
            height: auto;
            border-radius: 0;
            box-shadow: none;
        }
    `);
    // 创建悬浮窗
    setTimeout(function () {
        createFloatingWindow();
        pageMutation();
    }, 2000);
})();
