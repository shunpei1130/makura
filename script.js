document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------
    // Typing Text Increase Script
    // ---------------------------
    const typingTextElement = document.getElementById('typing-text');
    const typingContainerElement = document.getElementById('typing-container');
    const originalText = "『夢重力枕（Zero gravity）』は、柔らかく衛生的な 新素材TPE（ゲル構造）を採用した新しい寝具素材です。<br>ハニカムパターンのグリッド と低刺激性換気ラテックスにより、優れた弾力性と柔軟性を実現しています。<br> これにより、従来のウレタンフォームやファイバーに代わる、圧力分散と無重力のような寝心地を提供します。 <br>抜群の通気性と吸湿発散性により、頭部の熱を抑え、寝返りを減らすことができます。 <br>仰向けや横向きなど様々な睡眠姿勢に対応し、180度回転で2段階の高さ調整が可能です。<br>強い反発力を持つ、おすすめの枕です。"; // 実際のテキストに置き換え
    let displayedText = '';
    let zeroCount = 0; // newLengthが0であった回数をカウント
    let increaseAmount = 2; // デフォルトの増加量
    let isAnimating = false; // アニメーション中かどうかのフラグ
    let isTextFullyDisplayed = false; // テキストが完全に表示されたかのフラグ

    // スクロールを無効にする関数
    function disableScroll() {
        document.body.classList.add('no-scroll'); // CSSクラスを追加してスクロールを防止

        // スクロールを無効にするイベントリスナーを追加
        window.addEventListener('wheel', preventScroll, { passive: false });
        window.addEventListener('touchmove', preventScroll, { passive: false });
        window.addEventListener('keydown', preventScrollKeys, { passive: false });
    }

    // スクロールを有効にする関数
    function enableScroll() {
        document.body.classList.remove('no-scroll'); // CSSクラスを削除してスクロールを許可

        // スクロールを有効にするためのイベントリスナーを削除
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
        window.removeEventListener('keydown', preventScrollKeys);
    }

    // スクロールを無効にするための関数
    function preventScroll(event) {
        event.preventDefault(); // スクロールイベントを無効化
    }

    // キーボードによるスクロールを無効化する関数
    function preventScrollKeys(event) {
        // スクロールに関連するキーを無効化
        const keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
        if (keys.includes(event.keyCode)) {
            event.preventDefault();
        }
    }

    // テキストの透明度を更新する関数
    function updateTextOpacity() {
        const textLength = displayedText.length;
        typingTextElement.style.opacity = textLength > 0 ? 1 : 0; // 文字があれば表示、なければ非表示
    }

    // Throttle 関数（不要な場合は削除可能）
    function throttle(fn, limit) {
        let lastFunc;
        let lastRan;
        return function(...args) {
            const context = this;
            if (!lastRan) {
                fn.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        fn.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        }
    }

// Intersection Observer の設定 for typing-container
const typingObserverOptions = {
    root: null, // ビューポートをルートとする
    rootMargin: "0px 0px -20% 0px", // ビューポートの下に20%マージンを設定
    threshold: 0.5 // 50%表示されたときに発火
};

const typingObserverCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !isTextFullyDisplayed) { // 50%以上表示された場合
            disableScroll();
        } else {
            // 'typing-container' が表示されていない、またはテキストが完全に表示された場合
            if (isTextFullyDisplayed) {
                enableScroll();
            }
        }
    });
};

const typingObserver = new IntersectionObserver(typingObserverCallback, typingObserverOptions);
typingObserver.observe(typingContainerElement);

    // スワイプ開始位置を記録
    let startY = 0;
    window.addEventListener('touchstart', (event) => {
        startY = event.touches[0].clientY; // 最初のタッチ位置を取得
    }, { passive: true });

    // Scroll と Swipe の処理を最適化
    function handleScrollOrSwipe(event) {
        if (isTextFullyDisplayed) {
            // テキストが完全に表示されたらスクロールを有効化
            enableScroll();
            return;
        }

        // スクロールやスワイプの方向を判定
        let scrollDirection;
        if (event.type === 'wheel') {
            scrollDirection = event.deltaY > 0 ? 1 : -1; // スクロール方向の判定
        } else if (event.type === 'touchmove') {
            const touchMoveY = event.touches[0].clientY - startY; // タッチの移動量
            scrollDirection = touchMoveY > 0 ? -1 : 1; // 上にスワイプか下にスワイプか
        } else {
            return; // 他のイベントは無視
        }

        // スクロール方向に応じてテキストを増減
        if (scrollDirection > 0) {
            // 下にスクロールまたは下にスワイプ：テキストを増加
            revealText(increaseAmount);
        } else {
            // 上にスクロールまたは上にスワイプ：テキストを減少
            revealText(-increaseAmount);
        }
    }
    let isTextFullyHidden = false; // テキストが完全に非表示かどうかのフラグ


    function revealText(amount) {
        const newLength = Math.min(Math.max(displayedText.length + amount, 0), originalText.length);
        if (newLength !== displayedText.length) {
            displayedText = originalText.slice(0, newLength);
            typingTextElement.innerHTML = displayedText; // innerHTMLを使用して改行を反映
            updateTextOpacity();
    
            // 自動スクロール（ボックスの下に移動）
            const typingBox = document.getElementById('typing-box');
            typingBox.scrollTop = typingBox.scrollHeight;
    
            // テキストが完全に表示されたか、または完全に非表示になったかチェック
            if (displayedText.length >= originalText.length) {
                isTextFullyDisplayed = true;
                isTextFullyHidden = false;
                enableScroll();
            } else if (displayedText.length === 0) {
                isTextFullyDisplayed = false;
                isTextFullyHidden = true;
                enableScroll();
            } else {
                isTextFullyDisplayed = false;
                isTextFullyHidden = false;
            }
        }
    }
    

    // イベントリスナーの追加（スロットリングを削除）
    window.addEventListener('wheel', function(event) {
        if (document.body.classList.contains('no-scroll')) {
            handleScrollOrSwipe(event);
            event.preventDefault(); // デフォルトのスクロールを防止
        }
    }, { passive: false });

    window.addEventListener('touchmove', function(event) {
        if (document.body.classList.contains('no-scroll')) {
            handleScrollOrSwipe(event);
            event.preventDefault(); // デフォルトのスクロールを防止
        }
    }, { passive: false });

    window.addEventListener('keydown', function(event) {
        if (document.body.classList.contains('no-scroll')) {
            handleScrollOrSwipe(event);
            // キーボードスクロールは preventScrollKeys で処理されるため、ここでは特に処理不要
        }
    });

    // 初期化: テキストを非表示に設定
    typingTextElement.innerHTML = displayedText;
    updateTextOpacity();





    
    // ---------------------------
    // Background Image and Other Scripts
    // ---------------------------

    // 背景画像を管理する配列
    const backgroundImages = [
        { image: 'images/back1.png', start: 0, end: 1200 },  // 0pxから1200pxまで
        { image: 'images/back2.png', start: 1201, end: 2400 }, // 1201pxから2400pxまで
        { image: 'images/back3.png', start: 2401, end: Infinity } // 2401px以上
    ];

    const backgroundDiv = $('.background-image');
    let currentBackground = '';

    // スクロール時に背景画像を更新する関数
    function updateBackground() {
        const scrollPosition = $(window).scrollTop();
        
        // どの背景画像を適用するか判定
        for (let bg of backgroundImages) {
            if (scrollPosition >= bg.start && scrollPosition <= bg.end) {
                if (currentBackground !== bg.image) {
                    backgroundDiv.css('background-image', `url('${bg.image}')`);
                    currentBackground = bg.image;
                }
                break;
            }
        }
    }

    // 初期ロード時に背景を設定
    updateBackground();

    // スクロールイベントリスナーを追加（スロットリングでパフォーマンス向上）
    $(window).on('scroll', throttle(updateBackground, 100)); // 100ms スロットル

    /**
     * タイピングアニメーションを実行する関数
     * @param {Object} config - アニメーション設定
     * @param {string} config.textId - タイピング対象のテキスト要素のID
     * @param {string} config.cursorId - カーソル要素のID
     * @param {string} config.text - 表示するテキスト
     * @param {number} config.typingSpeed - タイピング速度（ミリ秒）
     */
    function typeText(config) {
        return new Promise((resolve) => {
            const typingElement = document.getElementById(config.textId);
            const cursorElement = document.getElementById(config.cursorId);
            const text = config.text;
            let currentCharIndex = 0;

            function type() {
                if (currentCharIndex < text.length) {
                    const currentChar = text.charAt(currentCharIndex);
                    if (currentChar === '夢') {
                        typingElement.innerHTML += `<span class="highlight">${currentChar}</span>`;
                    } else {
                        typingElement.innerHTML += currentChar;
                    }
                    currentCharIndex++;
                    setTimeout(type, config.typingSpeed);
                } else {
                    // タイピング完了
                    setTimeout(() => {
                        resolve();
                    }, 500); // タイピング完了後の待機時間
                }
            }

            type();
        });
    }

    /**
     * 消去アニメーションを実行する関数
     * @param {Object} config - アニメーション設定
     * @param {string} config.textId - 消去対象のテキスト要素のID
     * @param {string} config.cursorId - カーソル要素のID
     * @param {number} config.deletingSpeed - 消去速度（ミリ秒）
     */
    function deleteText(config) {
        return new Promise((resolve) => {
            const typingElement = document.getElementById(config.textId);
            const cursorElement = document.getElementById(config.cursorId);
            let text = typingElement.innerHTML;

            function del() {
                if (text.length > 0) {
                    if (text.endsWith('</span>')) {
                        // 「夢」の消去
                        const lastSpanIndex = text.lastIndexOf('<span class="highlight">');
                        if (lastSpanIndex !== -1) {
                            text = text.substring(0, lastSpanIndex);
                        }
                    } else {
                        // 通常文字の消去
                        text = text.slice(0, -1);
                    }
                    typingElement.innerHTML = text;
                    setTimeout(del, config.deletingSpeed);
                } else {
                    // 消去完了
                    setTimeout(() => {
                        resolve();
                    }, 500); // 消去完了後の待機時間
                }
            }

            del();
        });
    }

    /**
     * アニメーションのシーケンスを管理する関数
     */
    async function runAnimationSequence() {
        const h1Element = document.getElementById('typing-text1');
        const h2Element = document.getElementById('typing-text2');

        // 一回目の表示: h1 -> h2
        await typeText({
            textId: 'typing-text1',
            cursorId: 'cursor1',
            text: '無重力マクラ',
            typingSpeed: 150
        });

        await typeText({
            textId: 'typing-text2',
            cursorId: 'cursor2',
            text: '一般的な普通の枕',
            typingSpeed: 100
        });

        // 一回目の削除: h1 と h2 を同時に削除
        await Promise.all([
            deleteText({
                textId: 'typing-text1',
                cursorId: 'cursor1',
                deletingSpeed: 100
            }),
            deleteText({
                textId: 'typing-text2',
                cursorId: 'cursor2',
                deletingSpeed: 80
            })
        ]);

        // 二回目の表示前にフォントを変更（myfontクラスを追加）
        h1Element.classList.add('myfont');
        h2Element.classList.add('myfont');

        // 二回目の表示: h1 -> h2
        await typeText({
            textId: 'typing-text1',
            cursorId: 'cursor1',
            text: '夢重力マクラ',
            typingSpeed: 150
        });

        await typeText({
            textId: 'typing-text2',
            cursorId: 'cursor2',
            text: '夢の中で無重力体験を',
            typingSpeed: 100
        });

        // アニメーション終了後にカーソルを非表示にする
        setTimeout(() => {
            document.getElementById('cursor1').style.display = 'none';
            document.getElementById('cursor2').style.display = 'none';
        }, 500);
    }

    // アニメーションシーケンスの開始
    runAnimationSequence();

    // 追加コンテンツのフェードインアニメーション
    const additionalContent = document.querySelector('.additional-content');
    const ctaButton = document.querySelector('.cta-button');
    const featuresSection = document.querySelector('.features');
    const featureCards = document.querySelectorAll('.feature-card');
    const footer = document.querySelector('footer');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const subTitle = document.getElementById('subTitle'); // 追加

    // Create a separate IntersectionObserver for fade-in elements
    const fadeInObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const fadeInObserverCallback = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // 一度表示されたら監視を解除
            }
        });
    };

    const fadeInObserver = new IntersectionObserver(fadeInObserverCallback, fadeInObserverOptions);

    // 追加コンテンツを監視
    [additionalContent, ctaButton, featuresSection, footer, scrollIndicator, subTitle].forEach(el => {
        if (el) fadeInObserver.observe(el);
    });

    // 各 feature-card を監視
    featureCards.forEach((card) => {
        fadeInObserver.observe(card);
    });

    // 追加: スクロールインジケーターの制御
    const scrollIndicatorElement = document.querySelector('.scroll-indicator');
    const h1ObserverOptions = {
        root: null, // ビューポートを基準
        rootMargin: '0px',
        threshold: 0 // 少しでも見えていれば
    };

    const h1ObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                scrollIndicatorElement.classList.add('visible');
            } else {
                scrollIndicatorElement.classList.remove('visible');
            }
        });
    };

    const h1Observer = new IntersectionObserver(h1ObserverCallback, h1ObserverOptions);
    const typingText1 = document.getElementById('typing-text1');
    if (typingText1) h1Observer.observe(typingText1);
});
