const MaxTextWidth = 100000;

let SkiaModule;
let malgunFontBytes;
let myjoFontBytes;


const prmsSKiaInit = CanvasKitInit({
    locateFile: (file) => {
        return '/skia/'+file},
    })
    .then(CanvasKit => {
        SkiaModule = CanvasKit;
    });

const prmsDownloadFont1 = fetch('malgun.ttf')
    .then(response => {
        if (response.status === 200) {
            return response.arrayBuffer().then(data => {
                malgunFontBytes = data
            })
        }
    })

const prmsDownloadFont2 = fetch('myjo.ttf')
    .then(response => {
        if (response.status === 200) {
            return response.arrayBuffer().then(data => {
                myjoFontBytes = data
            })
        }
    })

Promise
    .all([prmsSKiaInit, prmsDownloadFont1, prmsDownloadFont2])
    .then(() => {
        const surface = SkiaModule.MakeCanvasSurface('skiaCanvas');

        const canvas = surface.getCanvas();
        canvas.clear(SkiaModule.Color4f(0.9, 0.9, 0.9, 1.0));

        const fontMgr = SkiaModule.FontMgr.FromData([malgunFontBytes, myjoFontBytes]);

        const text = "이것은 Skia 테스트 문자열입니다."
        let charPos = 0;
        let currentParaBuilder;
        let x = 10;
        let y = 100;

        for(let ch of text) {
            if (charPos === 0 || charPos === 13) {
                let paraStyle = new SkiaModule.ParagraphStyle({
                    textStyle: {
                        color: SkiaModule.BLACK,
                        fontFamilies: [fontMgr.getFamilyName(0)],
                        fontSize: 28,
                    },
                    textAlign: SkiaModule.TextAlign.Left,
                });

                currentParaBuilder = SkiaModule.ParagraphBuilder.Make(paraStyle, fontMgr);
            } else if (charPos === 4) {
                let paraStyle = new SkiaModule.ParagraphStyle({
                    textStyle: {
                        color: SkiaModule.RED,
                        fontFamilies: [fontMgr.getFamilyName(1)],
                        fontSize: 28,
                    },
                    textAlign: SkiaModule.TextAlign.Left,
                });

                currentParaBuilder = SkiaModule.ParagraphBuilder.Make(paraStyle, fontMgr);
            }
            if (ch === " ") {
                x += 14;
            } else {
                currentParaBuilder.reset();
                currentParaBuilder.addText(ch);
                const paragraph = currentParaBuilder.build();
                paragraph.layout(MaxTextWidth);

                const lineMetrix = paragraph.getLineMetrics()[0];
                canvas.drawParagraph(paragraph, x, y - lineMetrix.height);
                x += lineMetrix.width;
            }

            charPos++;
        }

        /*
        {

            canvas.drawText("명조", 200, 40, textPaint, textFont);
        }

         */

        surface.flush();
    })
