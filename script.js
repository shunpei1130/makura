document.addEventListener('DOMContentLoaded', () => {
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