// Number Emojis
const numberEmojis = {
    '0': '0️⃣',
    '1': '1️⃣',
    '2': '2️⃣',
    '3': '3️⃣',
    '4': '4️⃣',
    '5': '5️⃣',
    '6': '6️⃣',
    '7': '7️⃣',
    '8': '8️⃣',
    '9': '9️⃣'
};

// Number to Emoji converter
function getNumberEmoji(num) {
    return num.toString().split('').map(d => numberEmojis[d] || d).join('');
}

// Extract number from string
function extractNumber(str) {
    let num = '';
    for (let char of str) {
        if (char >= '0' && char <= '9') {
            num += char;
        }
    }
    return parseInt(num) || 0;
}

// =============================================
// ডুপ্লিকেট নাম চেক করার ফাংশন
// =============================================
function checkDuplicateNames(entries) {
    const nameMap = {};

    entries.forEach((entry) => {
        if (entry.isNoPost) return;

        let cleanName = entry.name
            .replace(/✅/g, '')
            .replace(/@/g, '')
            .replace(/📌/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (!cleanName || cleanName.length < 2) return;

        let nameKey = cleanName.toLowerCase();

        if (!nameMap[nameKey]) {
            nameMap[nameKey] = [];
        }
        nameMap[nameKey].push({
            position: entry.position,
            originalName: cleanName
        });
    });

    const duplicates = {};
    for (let key in nameMap) {
        if (nameMap[key].length > 1) {
            duplicates[key] = nameMap[key];
        }
    }

    return duplicates;
}

// =============================================
// ডুপ্লিকেট ইনলাইন সেকশন রেন্ডার
// =============================================
function renderDuplicateSection(duplicates) {
    const section = document.getElementById('duplicateSection');
    const body = document.getElementById('duplicateBody');
    const badge = document.getElementById('duplicateBadge');
    const card = document.getElementById('duplicateCard');
    const countEl = document.getElementById('duplicateCount');

    const dupKeys = Object.keys(duplicates);
    const dupCount = dupKeys.length;

    // আপডেট ডুপ্লিকেট কাউন্ট কার্ড
    countEl.textContent = dupCount;

    if (dupCount === 0) {
        section.classList.remove('show');
        card.classList.add('no-duplicate');
        card.querySelector('.label').textContent = 'ডুপ্লিকেট নেই ✓';
        return;
    }

    card.classList.remove('no-duplicate');
    card.querySelector('.label').textContent = 'ডুপ্লিকেট';

    // ব্যাজ আপডেট
    badge.textContent = dupCount;

    // বডি কন্টেন্ট তৈরি
    let html = '';

    dupKeys.forEach((key, index) => {
        const items = duplicates[key];
        const delay = index * 0.08;

        html += `<div class="dup-item" style="animation-delay: ${delay}s">`;
        html += `<div class="dup-item-name">`;
        html += `🔴 ${items[0].originalName}`;
        html += `<span class="dup-count-tag">${items.length} বার</span>`;
        html += `</div>`;
        html += `<div class="dup-positions">`;

        items.forEach((item) => {
            html += `<div class="dup-pos-tag">📍 নম্বর: <span>${item.position}</span></div>`;
        });

        html += `</div></div>`;
    });

    body.innerHTML = html;
    section.classList.add('show');
}

// টগল ডুপ্লিকেট ডিটেইলস
function toggleDuplicateDetails() {
    const body = document.getElementById('duplicateBody');
    const btn = document.getElementById('duplicateCloseBtn');

    if (body.style.display === 'none') {
        body.style.display = 'block';
        btn.textContent = '▼';
    } else {
        body.style.display = 'none';
        btn.textContent = '▶';
    }
}

// =============================================
// ডার্ক মোডাল পপআপ
// =============================================
function showDuplicateModal(duplicates) {
    const dupKeys = Object.keys(duplicates);
    if (dupKeys.length === 0) return;

    const modal = document.getElementById('duplicateModal');
    const modalBody = document.getElementById('modalBody');

    let html = '';

    // সামারি
    html += `<div class="modal-summary">`;
    html += `⚠️ মোট <span class="sum-number">${dupKeys.length}</span> টি ডুপ্লিকেট নাম পাওয়া গেছে`;
    html += `</div>`;

    dupKeys.forEach((key, index) => {
        const items = duplicates[key];
        const delay = index * 0.1;

        html += `<div class="modal-dup-item" style="animation-delay: ${delay}s">`;
        html += `<div class="modal-dup-name">`;
        html += `🔴 ${items[0].originalName}`;
        html += `<span class="times-badge">${items.length}x</span>`;
        html += `</div>`;
        html += `<div class="modal-dup-positions">`;

        items.forEach((item) => {
            html += `<div class="modal-pos-chip">📍 নম্বর: <span class="pos-num">${item.position}</span></div>`;
        });

        html += `</div></div>`;
    });

    modalBody.innerHTML = html;
    modal.classList.add('show');

    // বাইরে ক্লিক করলে বন্ধ
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('duplicateModal');
    modal.classList.remove('show');
}

// ডুপ্লিকেট কার্ডে ক্লিক করলে মোডাল দেখাবে
document.addEventListener('DOMContentLoaded', function () {
    const card = document.getElementById('duplicateCard');
    if (card) {
        card.addEventListener('click', function () {
            const count = parseInt(document.getElementById('duplicateCount').textContent);
            if (count > 0 && window._lastDuplicates) {
                showDuplicateModal(window._lastDuplicates);
            }
        });
    }
});


// =============================================
// Main Generate Function
// =============================================
function generateLists() {
    const input = document.getElementById('inputList').value.trim();

    if (!input) {
        alert('অনুগ্রহ করে লিস্ট পেস্ট করুন!');
        return;
    }

    const lines = input.split('\n');

    // Extract date and day
    let date = '';
    let day = '';

    for (let line of lines) {
        if (line.includes('তারিখ:')) {
            const match = line.match(/তারিখ:\s*([0-9\-\/\.]+)/);
            if (match) date = match[1];
        }
        if (line.includes('বার:')) {
            const match = line.match(/বার:\s*(\S+)/);
            if (match) day = match[1];
        }
    }

    // Parse entries
    const entries = [];

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        if (line.match(/[0-9]️⃣/) || line.match(/^[0-9]+[➤➔→]/)) {

            let position = extractNumber(line.split('➤')[0] || line.split('@')[0]);

            let content = line;
            const arrowIndex = line.indexOf('➤');
            if (arrowIndex !== -1) {
                content = line.substring(arrowIndex + 1).trim();
            }

            const hasCheckmark = content.includes('✅');

            const isNoPost = content.includes('𝙉𝙤 𝙋𝙤𝙨𝙩') ||
                content.toLowerCase().includes('no post') ||
                (content.includes('🅾️') && content.length < 30);

            let name = content.replace(/✅/g, '').trim();

            if (position > 0 || entries.length === 0) {
                entries.push({
                    position: position || entries.length + 1,
                    name: name,
                    hasCheckmark: hasCheckmark,
                    isNoPost: isNoPost
                });
            }
        }
    }

    if (entries.length === 0) {
        alert('কোনো এন্ট্রি পাওয়া যায়নি! সঠিক ফরম্যাটে লিস্ট দিন।');
        return;
    }

    // ডুপ্লিকেট চেক
    const duplicates = checkDuplicateNames(entries);
    window._lastDuplicates = duplicates; // মোডাল রি-ওপেনের জন্য সেভ

    // Generate All Done List
    let doneListText = `📅 তারিখ: ${date}\n📆 বার: ${day}\n\nযারা সাপোর্ট করেছেন\n\n👇👇👇\n\n`;

    entries.forEach((entry) => {
        const num = getNumberEmoji(entry.position);
        if (entry.isNoPost) {
            // পরিবর্তন: N/A → 🅾️𝙉𝙤 𝙋𝙤𝙨𝙩🅾️
            doneListText += `${num}➤🅾️𝙉𝙤 𝙋𝙤𝙨𝙩🅾️\n`;
        } else if (entry.hasCheckmark) {
            doneListText += `${num}➤${entry.name}\n`;
        } else {
            doneListText += `${num}➤@\n`;
        }
    });

    // Generate Unsupporter List
    const unsupporters = entries.filter(e => !e.hasCheckmark && !e.isNoPost);

    let unsupportListText = `🌟 সাপোর্ট লিংক বক্স টিম নোটিশ 🌟\n📅 তারিখ: ${date} (${day})\n\n\n📋 সাপোর্ট বাকি থাকা মেম্বারদের তালিকা:\n\n`;

    unsupporters.forEach((entry, index) => {
        const num = getNumberEmoji(index + 1);
        unsupportListText += `${num} ${entry.name} 📌/${entry.position}\n`;
    });

    if (unsupporters.length === 0) {
        unsupportListText += "🎉 সবাই সাপোর্ট করেছে! কেউ বাকি নেই।";
    }

    unsupportListText += `\n\n⚠️ গুরুত্বপূর্ণ সতর্কতা ⚠️\nরাত ১২টার আগে All Done না করায় আপনাদেরকে লিংকবক্স থেকে রিমুভ করা হয়েছে। 🚫\n\nকরণীয়:\n1️⃣ আমাদের ফেসবুক গ্রুপে সকল লিংক দেওয়া আছে, সেখান থেকে সকল লিংকে সাপোর্ট কমপ্লিট করুন! 🔗\n\n2️⃣ All Done করে অ্যাডমিনদের জানান। 📩\n✅ এটি করলেই আপনাদের পুনরায় একদিন পরে অ্যাড করা হবে! 🎉\n\n🥹তবে আজকে এড করা হবে না 🥹\n\n🚫 ভুয়া All Done করার কথা ভুলে যান! 🚫`;

    // Stats
    const totalMembers = entries.filter(e => !e.isNoPost).length;
    const doneMembers = entries.filter(e => e.hasCheckmark && !e.isNoPost).length;
    const pendingMembers = unsupporters.length;
    const noPostCount = entries.filter(e => e.isNoPost).length;

    document.getElementById('totalCount').textContent = totalMembers;
    document.getElementById('doneCount').textContent = doneMembers;
    document.getElementById('pendingCount').textContent = pendingMembers;
    document.getElementById('nopostCount').textContent = noPostCount;

    // Display results
    document.getElementById('doneList').textContent = doneListText;
    document.getElementById('unsupportList').textContent = unsupportListText;

    // Show output
    document.getElementById('outputSection').classList.add('show');

    // ডুপ্লিকেট ইনলাইন সেকশন রেন্ডার
    renderDuplicateSection(duplicates);

    // ডুপ্লিকেট থাকলে মোডাল দেখাও
    if (Object.keys(duplicates).length > 0) {
        setTimeout(() => {
            showDuplicateModal(duplicates);
        }, 600);
    }

    // Scroll
    document.getElementById('outputSection').scrollIntoView({
        behavior: 'smooth'
    });
}

// =============================================
// Copy Functions
// =============================================
function copyDoneList(button) {
    copyToClipboard('doneList', button);
}

function copyUnsupportList(button) {
    copyToClipboard('unsupportList', button);
}

function copyToClipboard(elementId, button) {
    const text = document.getElementById(elementId).textContent;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopiedFeedback(button);
        }).catch(() => {
            fallbackCopy(text, button);
        });
    } else {
        fallbackCopy(text, button);
    }
}

function fallbackCopy(text, button) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);

    try {
        document.execCommand('copy');
        showCopiedFeedback(button);
    } catch (err) {
        alert('কপি করতে সমস্যা হয়েছে!');
    }

    document.body.removeChild(textarea);
}

function showCopiedFeedback(button) {
    const originalText = button.textContent;

    button.textContent = '✅ কপি হয়েছে!';
    button.classList.add('copied');

    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
    }, 2000);
}
