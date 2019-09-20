const DEBUG = false;
const MAX_WORD_LIMIT = 7;
const CARD_ID = 'baikeplugin';
const CARD_WIDTH = 350;
const CARD_PADDING = 14;

let mouseX;
let mouseY;
let cardShowing = false;
let ctrlPressed = false;

/**
 * Mouse up event
 * @param e
 */
function mouseUp(e) {
    if (options.enabled) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        debug(e.target.tagName);

        if (cardShowing) {
            const card = e.path.find(elem => {
                return elem.id === CARD_ID;
            });
            if (!card) {
                removeCard();
            }
        } else {
            if (options.auto_show) {
                showCardIfTextSelected();
            }
        }
    }
}

/**
 * Mouse down event
 * @param e
 */
function mouseDown(e) {
    if (options.enabled) {
        mouseX = e.pageX;
        mouseY = e.pageY;
    }
}

/**
 * Key down event
 * @param e
 */
function keyDown(e) {
    if (e.ctrlKey) {
        ctrlPressed = true;
    }
}

/**
 * Key up event
 * @param e
 */
function keyUp(e) {
    ctrlPressed = e.ctrlKey;
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) { //判断响应的状态码是否正常
    return response //正常返回原响应对象
  } else {
    var error = new Error(response.statusText) //不正常则抛出一个响应错误状态信息
    error.response = response
    throw error
  }
}

/**
 * 获取百度百科摘要
 * @param words
 */
function fetchBaikeSummary(words) {
    if (words) {
		url = `https://baike.baidu.com/item/${words.join("_")}`;
		debug(url);
        fetch(url)
			.then(checkStatus)
            .then(response => response.text())
            .then(body => {
                debug(body);
				var htmlDoc = document.createElement('html');
				htmlDoc.innerHTML = body;
				var image, text;
				if (htmlDoc.querySelector('.sorryBox') !== null) {
					text = chrome.i18n.getMessage("unRecord");
					url = null;
				} else {
					try {
						image = htmlDoc.querySelector('.summary-pic>a>img[src]').src;
					}
					catch(err) {
						debug(err);
					}
					text = htmlDoc.querySelector("meta[name=description]").content;
				}
				if (text !== undefined) {
					addCard(image, text, url);
				}
            }).catch(err => {
            debug(err);
        });		
    }
}

/**
 * Returns currently selected text
 * @returns {*}
 */
function getSelectionText() {
    let text = null;
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type !== "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

/**
 * If text selected, attempt to fetch summary
 */
function showCardIfTextSelected() {
    removeCard();
    const selectedText = getSelectionText();
    const ctrlHeld = !options.ctrlRequired || ctrlPressed;
    if (selectedText && ctrlHeld) {
        const selectedWords = selectedText.split(" ").map(word => {
            word = word.replace(/[&\/\\#,+();_\-$~%.’'":*?<>{}]/g, '');
            if (word.length > 0) {
                return word;
            }
        });

        if (selectedWords.length > 0 && selectedWords.length < MAX_WORD_LIMIT) {
            fetchBaikeSummary(selectedWords);
        }
    }
}

/**
 * Renders card on screen with given info
 * @param image
 * @param body
 * @param articleUrl
 */
function addCard(image, body, articleUrl) {
    removeCard();
    const data = {
        image: image,
        imageHeight: image ? 150 : 0,
        body: body,
        articleUrl: articleUrl,
        theme: options.dark ? 'dark' : 'light',
    };
    const popup = Mustache.render(TEMPLATE, data);
    const popupNode = document.createElement('div');

    let x;
    if (mouseX + CARD_WIDTH / 2 > window.innerWidth) {
        x = window.innerWidth - CARD_WIDTH - CARD_PADDING * 2;
    } else if (mouseX - CARD_WIDTH / 2 < 0) {
        x = CARD_PADDING;
    } else {
        x = mouseX - CARD_WIDTH / 2;
    }

    popupNode.style.left = `${x}px`;
    popupNode.style.top = `${mouseY + CARD_PADDING}px`;
    popupNode.setAttribute("id", CARD_ID);
	if (articleUrl === null) {
		popupNode.style.textAlign = `center`;
	}
    popupNode.innerHTML = popup;
    document.body.appendChild(popupNode);
    cardShowing = true;
    setTimeout(function () {
        popupNode.setAttribute("class", CARD_ID + '-show');
    }, 10);
}

/**
 * Removes card from screen
 */
function removeCard() {
    const card = document.getElementById(CARD_ID);
    if (card) {
        card.setAttribute("class", '');
        setTimeout(function () {
            if (card.parentElement) {
                document.body.removeChild(card);
            }
            cardShowing = false;
        }, 500);
    }
}

function debug(msg) {
    if (DEBUG) {
        console.log(msg);
    }
}

/**
 * Message listener
 */
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message) {
        if (request.message === "show-card") {
            showCardIfTextSelected();
        }
        return true;
    }
});

/**
 * Keep polling until DOM is ready
 */
chrome.extension.sendMessage({}, response => {
    let readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            // Page loaded
            restoreOptions(function () {
                document.addEventListener("mousedown", mouseDown, false);
                document.addEventListener("mouseup", mouseUp, false);
                document.addEventListener("keydown", keyDown, false);
                document.addEventListener("keyup", keyUp, false);
            });
        }
    }, 10);
});