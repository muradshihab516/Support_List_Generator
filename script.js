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

// Main Generate Function
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
        
        // Check if line has number emoji or starts with number
        if (line.match(/[0-9]️⃣/) || line.match(/^[0-9]+[➤➔→]/)) {
            
            let position = extractNumber(line.split('➤')[0] || line.split('@')[0]);
            
            // Get content after arrow
            let content = line;
            const arrowIndex = line.indexOf('➤');
            if (arrowIndex !== -1) {
                content = line.substring(arrowIndex + 1).trim();
            }
            
            // Check for checkmark
            const hasCheckmark = content.includes('✅');
            
            // Check for No Post
            const isNoPost = content.includes('𝙉𝙤 𝙋𝙤𝙨𝙩') || 
                            content.toLowerCase().includes('no post') || 
                            (content.includes('🅾️') && content.length < 30);
            
            // Clean name
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

    // Check if entries found
    if (entries.length === 0) {
        alert('কোনো এন্ট্রি পাওয়া যায়নি! সঠিক ফরম্যাটে লিস্ট দিন।');
        return;
    }

    // Generate All Done List
    let doneListText = `📅 তারিখ: ${date}\n📆 বার: ${day}\n\nযারা সাপোর্ট করেছেন\n\n👇👇👇\n\n`;
    
    entries.forEach((entry) => {
        const num = getNumberEmoji(entry.position);
        if (entry.isNoPost) {
            doneListText += `${num}➤#N/A\n`;
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

    // If no unsupporters
    if (unsupporters.length === 0) {
        unsupportListText += "🎉 সবাই সাপোর্ট করেছে! কেউ বাকি নেই।";
    }

    // --- এখানে আপনার সতর্কবার্তাটি যুক্ত করা হয়েছে ---
    unsupportListText += `\n\n⚠️ গুরুত্বপূর্ণ সতর্কতা ⚠️\nরাত ১২টার আগে All Done না করায় আপনাদেরকে লিংকবক্স থেকে রিমুভ করা হয়েছে। 🚫\n\nকরণীয়:\n1️⃣ আমাদের ফেসবুক গ্রুপে সকল লিংক দেওয়া আছে, সেখান থেকে সকল লিংকে সাপোর্ট কমপ্লিট করুন! 🔗\n\n2️⃣ All Done করে অ্যাডমিনদের জানান। 📩\n✅ এটি করলেই আপনাদের পুনরায় একদিন পরে অ্যাড করা হবে! 🎉\n\n🥹তবে আজকে এড করা হবে না 🥹\n\n🚫 ভুয়া All Done করার কথা ভুলে যান! 🚫`;

    // Calculate stats
    const totalMembers = entries.filter(e => !e.isNoPost).length;
    const doneMembers = entries.filter(e => e.hasCheckmark && !e.isNoPost).length;
    const pendingMembers = unsupporters.length;
    const noPostCount = entries.filter(e => e.isNoPost).length;

    // Update UI stats
    document.getElementById('totalCount').textContent = totalMembers;
    document.getElementById('doneCount').textContent = doneMembers;
    document.getElementById('pendingCount').textContent = pendingMembers;
    document.getElementById('nopostCount').textContent = noPostCount;

    // Display results
    document.getElementById('doneList').textContent = doneListText;
    document.getElementById('unsupportList').textContent = unsupportListText;
    
    // Show output section
    document.getElementById('outputSection').classList.add('show');
    
    // Scroll to results
    document.getElementById('outputSection').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Copy Done List
function copyDoneList(button) {
    copyToClipboard('doneList', button);
}

// Copy Unsupport List
function copyUnsupportList(button) {
    copyToClipboard('unsupportList', button);
}

// Copy to Clipboard Function
function copyToClipboard(elementId, button) {
    const text = document.getElementById(elementId).textContent;
    
    // Try modern clipboard API
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

// Fallback copy for older browsers
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

// Show copied feedback
function showCopiedFeedback(button) {
    const originalText = button.textContent;
    const originalClass = button.className;
    
    button.textContent = '✅ কপি হয়েছে!';
    button.classList.add('copied');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
    }, 2000);
    }
