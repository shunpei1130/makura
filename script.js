document.addEventListener('DOMContentLoaded', () => {
    const zoomModal = document.getElementById('zoomModal');
    const closeModal = document.getElementById('closeModal');
    const items = document.querySelectorAll('.carousel .item');
    const slider = document.querySelector('.slider');
    const prevSlideBtn = document.getElementById('prevSlide');
    const nextSlideBtn = document.getElementById('nextSlide');
    let currentIndex = 0;
    let currentImages = [];

    // アイテムをクリックしたときにモーダルを開く
    items.forEach((item) => {
        item.addEventListener('click', () => {
            const images = JSON.parse(item.getAttribute('data-images'));
            setSliderImages(images);
            zoomModal.classList.remove('hidden');
        });
    });

    // モーダルを閉じる
    closeModal.addEventListener('click', () => {
        zoomModal.classList.add('hidden');
    });

    // 外部クリックでモーダルを閉じる
    zoomModal.addEventListener('click', (e) => {
        if (e.target === zoomModal) {
            zoomModal.classList.add('hidden');
        }
    });

// スライドの画像を設定
function setSliderImages(images) {
    currentImages = images;
    currentIndex = 0;
    // スライダーをリセット
    slider.innerHTML = '';
    images.forEach((src) => {
        const slide = document.createElement('div');
        slide.classList.add('slide', 'min-w-full', 'flex-shrink-0');
        const img = document.createElement('img');
        img.src = src; // "images/1.jpg" などのパスが指定されている
        img.alt = "詳細画像";
        img.classList.add('max-w-full', 'max-h-96', 'mx-auto', 'object-contain'); // ここを変更
        slide.appendChild(img);
        slider.appendChild(slide);
    });
    updateSliderPosition();
}


    // スライドの位置を更新
    function updateSliderPosition() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    // 前のスライドへ
    prevSlideBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
        }
    });

    // 次のスライドへ
    nextSlideBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentIndex < currentImages.length - 1) {
            currentIndex++;
            updateSliderPosition();
        }
    });

    
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
    const sectionContent = document.querySelector('.section__content');
    const sectionContent2 = document.querySelector('.section__content2');

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
    [additionalContent, ctaButton, featuresSection, footer, scrollIndicator, sectionContent2, sectionContent].forEach(el => {
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

// モバイルサイズのメディアクエリ（例: 幅768px以下）
const mobileMediaQuery = window.matchMedia('(max-width: 768px)');

let scrollListenerAdded = false;

// アニメーションを初期化する関数
function initScrollLinkedAnimation() {
    const h5 = document.querySelector('h5');
    const spans = h5.querySelectorAll('span');

    // アニメーションが発生するビューポート内の開始点と終了点（割合）
    const animationStartRatio = 0.2; // ビューポートの20%の位置
    const animationEndRatio = 0.8;   // ビューポートの80%の位置

    // アニメーションの更新関数
    function updateAnimation() {
        const rect = h5.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        // アニメーションの開始位置と終了位置をピクセルで計算
        const startPoint = viewportHeight * animationStartRatio;
        const endPoint = viewportHeight * animationEndRatio;

        // h5要素の上端と下端の位置
        const h5Top = rect.top;
        const h5Bottom = rect.bottom;

        let progress = 0;

        // h5要素がアニメーション範囲内に入っているかチェック
        if (h5Top < endPoint && h5Bottom > startPoint) {
            const totalRange = h5Bottom - h5Top;
            const scrolled = endPoint - h5Top;
            progress = scrolled / (endPoint - startPoint);
            progress = Math.min(Math.max(progress, 0), 1); // 0から1の範囲にクランプ
        }

        // 各span要素のスタイルを更新
        spans.forEach((span, index) => {
            let scale;
            let opacity;

            // spanのインデックスに基づいてアニメーションの種類を決定
            if (index === 0 || index === 2) {
                // span 1と3はスケールダウン
                scale = 1.5 - 1.5 * progress;
                opacity = 1 - progress;
            } else if (index === 1 || index === 3) {
                // span 2と4はスケールアップ
                scale = 0 + 1.5 * progress;
                opacity = progress;
            }

            // 計算したスケールとオパシティを適用
            span.style.transform = `scale(${scale})`;
            span.style.opacity = opacity;
        });
    }

    // スクロールイベントを効率的に処理するためのフラグ
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateAnimation();
                ticking = false;
            });
            ticking = true;
        }
    }

    // スクロールイベントリスナーを追加
    window.addEventListener('scroll', onScroll);
    scrollListenerAdded = true;

    // 初期ロード時にもアニメーションを更新
    updateAnimation();
}

// アニメーションを解除する関数（必要に応じてリセット）
function removeScrollLinkedAnimation() {
    const h5 = document.querySelector('h5');
    const spans = h5.querySelectorAll('span');

    // スクロールイベントリスナーの削除
    if (scrollListenerAdded) {
        window.removeEventListener('scroll', onScroll);
        scrollListenerAdded = false;
    }

    // 各spanのスタイルをリセット
    spans.forEach(span => {
        span.style.transform = 'scale(0)';
        span.style.opacity = '0';
    });
}

// アニメーションの更新関数を外部でアクセス可能にするために変数に保持
let onScroll = () => {};

// アニメーションを初期化する関数を更新
function initScrollLinkedAnimationUpdated() {
    const h5 = document.querySelector('h5');
    const spans = h5.querySelectorAll('span');

    // アニメーションが発生するビューポート内の開始点と終了点（割合）
    const animationStartRatio = 0.2; // ビューポートの20%の位置
    const animationEndRatio = 0.8;   // ビューポートの80%の位置

    // アニメーションの更新関数
    function updateAnimation() {
        const rect = h5.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        // アニメーションの開始位置と終了位置をピクセルで計算
        const startPoint = viewportHeight * animationStartRatio;
        const endPoint = viewportHeight * animationEndRatio;

        // h5要素の上端と下端の位置
        const h5Top = rect.top;
        const h5Bottom = rect.bottom;

        let progress = 0;

        // h5要素がアニメーション範囲内に入っているかチェック
        if (h5Top < endPoint && h5Bottom > startPoint) {
            const totalRange = h5Bottom - h5Top;
            const scrolled = endPoint - h5Top;
            progress = scrolled / (endPoint - startPoint);
            progress = Math.min(Math.max(progress, 0), 1); // 0から1の範囲にクランプ
        }

        // 各span要素のスタイルを更新
        spans.forEach((span, index) => {
            let scale;
            let opacity;

            // spanのインデックスに基づいてアニメーションの種類を決定
            if (index === 0 || index === 2) {
                // span 1と3はスケールダウン
                scale = 1.5 - 1.5 * progress;
                opacity = 1 - progress;
            } else if (index === 1 || index === 3) {
                // span 2と4はスケールアップ
                scale = 0 + 1.5 * progress;
                opacity = progress;
            }

            // 計算したスケールとオパシティを適用
            span.style.transform = `scale(${scale})`;
            span.style.opacity = opacity;
        });
    }

    // スクロールイベントを効率的に処理するためのフラグ
    let ticking = false;
    onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateAnimation();
                ticking = false;
            });
            ticking = true;
        }
    };

    // スクロールイベントリスナーを追加
    window.addEventListener('scroll', onScroll);
    scrollListenerAdded = true;

    // 初期ロード時にもアニメーションを更新
    updateAnimation();
}

// アニメーションを解除する関数（必要に応じてリセット）
function removeScrollLinkedAnimation() {
    const h5 = document.querySelector('h5');
    const spans = h5.querySelectorAll('span');

    // スクロールイベントリスナーの削除
    if (scrollListenerAdded) {
        window.removeEventListener('scroll', onScroll);
        scrollListenerAdded = false;
    }

    // 各spanのスタイルをリセット
    spans.forEach(span => {
        span.style.transform = 'scale(0)';
        span.style.opacity = '0';
    });
}

// メディアクエリの変更を監視
mobileMediaQuery.addEventListener('change', (e) => {
    if (e.matches) {
        // モバイルサイズになったらアニメーションを初期化
        initScrollLinkedAnimationUpdated();
    } else {
        // モバイルサイズから外れたらアニメーションを解除
        removeScrollLinkedAnimation();
    }
});

// 初期ロード時にメディアクエリをチェック
if (mobileMediaQuery.matches) {
    initScrollLinkedAnimationUpdated();
}
});