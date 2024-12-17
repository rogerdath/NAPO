import localFont from 'next/font/local';

export const scala = localFont({
    src: [
        {
            path: '../public/fonts/ScalaSans.otf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../public/fonts/ScalaSansBold.otf',
            weight: '700',
            style: 'normal',
        }
    ],
    variable: '--font-scala'
});

export const calibri = localFont({
    src: [
        {
            path: '../public/fonts/Calibri.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../public/fonts/CalibriB.ttf',
            weight: '700',
            style: 'normal',
        }
    ],
    variable: '--font-calibri'
}); 