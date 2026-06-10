const fs = require('fs');
let content = fs.readFileSync('./src/constants/mockData.js', 'utf-8');

const map = {
    'all': 'Tümü',
    'kebap': 'Yöresel Lezzetler',
    'meze': 'Yöresel Lezzetler',
    'baklava': 'Yöresel Lezzetler',
    'museum': 'Müzeler',
    'historical': 'Tarihi Mekanlar',
    'shopping': 'Alışveriş',
};

// Also 'all' can be kept as 'all' and we just use 'all' for the "Tümü" filter. Let's keep 'all'.
const mapToKeepAll = {
    'all': 'all',
    'kebap': 'Yöresel Lezzetler',
    'meze': 'Yöresel Lezzetler',
    'baklava': 'Yöresel Lezzetler',
    'museum': 'Müzeler',
    'historical': 'Tarihi Mekanlar',
    'shopping': 'Alışveriş',
};

content = content.replace(/categories:\s*\[([\s\S]*?)\]/g, (match, p1) => {
    const items = p1.match(/\"(.*?)\"/g);
    if (!items) return match;
    const newItems = new Set();
    items.forEach(i => {
        const cleanItem = i.replace(/\"/g, '');
        if (mapToKeepAll[cleanItem]) {
            newItems.add(`"${mapToKeepAll[cleanItem]}"`);
        } else {
            newItems.add(`"${cleanItem}"`); // fallback
        }
    });
    return `categories: [\n      ${Array.from(newItems).join(',\n      ')}\n    ]`;
});

fs.writeFileSync('./src/constants/mockData.js', content);
console.log('mockData.js updated!');
