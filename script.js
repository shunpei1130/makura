document.addEventListener('DOMContentLoaded', () => {
    const typingTextElement = document.getElementById('typing-text');
    const originalText = "『夢重力枕（Zero gravity）』は、柔らかく衛生的な 新素材TPE（ゲル構造）を採用した新しい寝具素材です。<br>ハニカムパターンのグリッド と低刺激性換気ラテックスにより、優れた弾力性と柔軟性を実現しています。<br> これにより、従来のウレタンフォームやファイバーに代わる、圧力分散と無重力のような寝心地を提供します。 <br>抜群の通気性と吸湿発散性により、頭部の熱を抑え、寝返りを減らすことができます。 <br>仰向けや横向きなど様々な睡眠姿勢に対応し、180度回転で2段階の高さ調整が可能です。<br>強い反発力を持つ、おすすめの枕です。"; // 実際のテキストに置き換え
    let displayedText = '';
    let previousLength = 0; // 前回の表示文字数を保存
    let zeroCount = 0; // previousLengthが0であった回数をカウント
    let increaseAmount = 2; // デフォルトの増加量

    // スクロールを無効にする関数
    function disableScroll() {
        console.log('disableScroll');
        document.body.style.overflowY = 'hidden'; // ボディのオーバーフローを隠す

        // スクロールを無効にするイベントリスナーを追加
        window.addEventListener('wheel', preventScroll, { passive: false });
        window.addEventListener('touchmove', preventScroll, { passive: false });
    }

    // スクロールを有効にする関数
    function enableScroll() {
        console.log('enableScroll');
        document.body.style.overflowY = ''; // オーバーフローを元に戻す
        isScrollEnabled = true; // スクロール有効フラグを立てる

        // スクロールを有効にするためのイベントリスナーを削除
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
        window.addEventListener('wheel', preventScroll, { passive: true });
        window.addEventListener('touchmove', preventScroll, { passive: true });
    }

    // スクロールを無効にするための関数
    function preventScroll(event) {
        console.log('preventScroll');
        event.preventDefault(); // スクロールイベントを無効化
    }

    // スクロールおよびスワイプ処理
    function handleScrollOrSwipe(event) {
        console.log('handleScrollOrSwipe');
        // 対象のテキストが一致するか確認
        if (typingTextElement.innerHTML === originalText) {
            enableScroll(); // すでに表示されている場合、スクロールを有効に
            return; // 処理を終了して何もしない
        }

        const sectionRect = typingTextElement.getBoundingClientRect();
        const scrollLimit = window.innerHeight * 0.7; // 画面上から30%の位置

        // typing-textが上から30%の位置に来ているかどうかをチェック
        const isInView = sectionRect.top <= scrollLimit;

        if (isInView) {
            // スクロールを無効にする
            event.preventDefault(); // スクロールイベントを無効化
            disableScroll(); // ボディのスクロールを無効に

            let scrollDirection;

            // スクロールイベントの場合
            if (event.type === 'wheel') {
                scrollDirection = event.deltaY > 0 ? 1 : -1; // スクロール方向の判定
                increaseAmount = 13; // マウススクロール時の増加量を増やす
            } 
            // タッチイベントの場合
            else if (event.type === 'touchmove') {
                const touchMoveY = event.touches[0].clientY - startY; // タッチの移動量
                scrollDirection = touchMoveY > 0 ? -1 : 1; // 上にスワイプか下にスワイプか
                increaseAmount = 2; // マウススクロール時の増加量を増やす
            }
            // 増減する文字数
            const newLength = Math.min(Math.max(displayedText.length + (scrollDirection * increaseAmount), 0), originalText.length);

            previousLength = newLength; // 現在の文字数を保存
            console.log(previousLength);

            // previousLengthが0だったらzeroCountを増やす
            if (previousLength === 0) {
                zeroCount++;
            } else {
                zeroCount = 0; // previousLengthが0でなければカウントをリセット
            }
            console.log(zeroCount);
             
            // zeroCountが2以上であれば全体のif文を抜ける
            if (zeroCount >= 2) {
                enableScroll(); // スクロールを有効に
                return; // 処理を終了して何もしない
            }

            // 文字数を更新
            if (newLength !== displayedText.length) {
                displayedText = originalText.slice(0, newLength);
                typingTextElement.innerHTML = displayedText; // innerHTMLを使用して改行を反映
                updateTextOpacity();
            }
        } else {
            enableScroll(); // ボディのスクロールを有効に
        }
    }

    // スワイプ開始位置を記録
    let startY = 0;
    window.addEventListener('touchstart', (event) => {
        startY = event.touches[0].clientY; // 最初のタッチ位置を取得
    });

    // スワイプイベントを追加
    window.addEventListener('touchmove', (event) => {
        handleScrollOrSwipe(event); // スワイプイベントを処理
    });

    // スクロールイベントリスナーを追加
    window.addEventListener('wheel', (event) => {
        handleScrollOrSwipe(event); // スクロールイベントを処理
    }); 

    // テキストの透明度を更新する関数
    function updateTextOpacity() {
        const textLength = displayedText.length;
        typingTextElement.style.opacity = textLength > 0 ? 1 : 0; // 文字があれば表示、なければ非表示
    }
});




// ここまでがテキスト増加処理のコードです。




document.addEventListener('DOMContentLoaded', () => {
    // 背景画像を管理する配列
    const backgroundImages = [
        { image: 'images/back1.png', start: 0, end: 1200 },  // 601pxから1200pxまで
        { image: 'images/back2.png', start: 1201, end: 2400 }, // 1201pxから1800pxまで
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
    $(window).on('scroll', throttle(updateBackground, 200));

    // パフォーマンス向上のためのスロットリング関数
    function throttle(fn, wait) {
        let time = Date.now();
        return function() {
            if ((time + wait - Date.now()) < 0) {
                fn();
                time = Date.now();
            }
        }
    }
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

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // 一度表示されたら監視を解除
            }
        });
    }, observerOptions);

    // 追加コンテンツを監視
    observer.observe(additionalContent);
    observer.observe(ctaButton);
    observer.observe(featuresSection);
    observer.observe(footer);
    observer.observe(scrollIndicator);
    observer.observe(subTitle); // 追加

    // 各 feature-card を監視
    featureCards.forEach((card) => {
        observer.observe(card);
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
    h1Observer.observe(document.getElementById('typing-text1'));
});
