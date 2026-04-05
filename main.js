import JSZip from 'jszip';

// --- CONFIGURATION ---
// Replace with your GoHighLevel or other webhook URL to capture leads
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby00dqcVomWfVeHmRi0IKvAJnLrCme_Aus6hEDSGXQIG0IuOMLa4JrNyqtS16uMVm6I3g/exec';

// --- HUB NAVIGATION ---
window.switchTool = (toolId) => {
    // Update tabs
    document.querySelectorAll('.tool-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tool === toolId);
    });

    // Update tool containers
    document.querySelectorAll('.tool-container').forEach(container => {
        container.classList.toggle('active', container.id === `${toolId}-tool`);
    });
};

// State Management
let currentStep = 1;
const skillData = {
    name: '',
    description: '',
    instructions: '',
    slug: ''
};
const leadData = {
    firstName: '',
    email: ''
};

// DOM Elements
const views = {
    1: document.getElementById('view-step-1'),
    2: document.getElementById('view-step-2'),
    3: document.getElementById('view-step-3'),
    4: document.getElementById('view-step-4')
};
const indicators = document.querySelectorAll('.indicator-item');

// Navigation Functions
window.nextStep = (step) => {
    if (step === 2) {
        const name = document.getElementById('gpt-name').value.trim();
        const desc = document.getElementById('gpt-description').value.trim();
        if (!name || !desc) {
            alert('Please fill in both the skill name and description.');
            return;
        }
        skillData.name = name;
        skillData.description = desc;
        skillData.slug = slugify(name);
    }

    if (step === 3) {
        const instructions = document.getElementById('gpt-instructions').value.trim();
        if (!instructions) {
            alert('Please provide instructions to synthesize.');
            return;
        }
        skillData.instructions = instructions;
    }

    switchView(step);
};

window.prevStep = (step) => {
    switchView(step);
};

window.scrollToConverter = () => {
    document.getElementById('converter').scrollIntoView({ behavior: 'smooth' });
};

function switchView(step) {
    Object.values(views).forEach(v => v && v.classList.remove('active'));
    if (views[step]) views[step].classList.add('active');

    indicators.forEach(ind => {
        const s = parseInt(ind.dataset.step);
        ind.classList.toggle('active', s === step);
    });

    currentStep = step;
    window.scrollTo(0, document.getElementById('converter').offsetTop - 100);
}

// Synthesis + Lead Capture
window.synthesizeSkill = async () => {
    const firstName = document.getElementById('lead-name').value.trim();
    const email = document.getElementById('lead-email').value.trim();

    if (!firstName || !email) {
        alert('Please enter your first name and email to unlock your skill.');
        return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    leadData.firstName = firstName;
    leadData.email = email;

    const btn = document.getElementById('synthesize-btn');
    btn.disabled = true;
    btn.innerText = 'Synthesizing Components...';

    // Submit lead in background (non-blocking)
    submitLead(firstName, email).catch(err => console.warn('Lead capture failed silently:', err));

    await new Promise(resolve => setTimeout(resolve, 1200));
    btn.innerText = 'Analyzing Logic Gates...';
    await new Promise(resolve => setTimeout(resolve, 900));

    // Generate preview
    const skillContent = generateSkillMarkdown();
    document.getElementById('skill-preview').innerText = skillContent;
    document.getElementById('slug-name').innerText = skillData.slug;

    btn.innerText = 'Unlock & Synthesize';
    btn.disabled = false;

    switchView(4);
};

async function submitLead(firstName, email) {
    if (!WEBHOOK_URL || WEBHOOK_URL === 'YOUR_GHL_WEBHOOK_URL_HERE') {
        console.log('Lead capture: No webhook configured.', { firstName, email });
        return;
    }
    await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            firstName: firstName,
            email: email,
            skill_name: skillData.name,
            source: 'Profit Lab Skill Builder',
            tab_name: 'GPT-Convert tab'
        })
    });
}

function generateSkillMarkdown() {
    return `---
name: ${skillData.name}
description: ${skillData.description}
---

# Instructions
${skillData.instructions}
`;
}

window.downloadZip = async () => {
    const zip = new JSZip();
    const skillFolder = zip.folder(".claude").folder("skills").folder(skillData.slug);
    skillFolder.file("SKILL.md", generateSkillMarkdown());

    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profit-lab-skill-${skillData.slug}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

window.resetConverter = () => {
    document.getElementById('gpt-name').value = '';
    document.getElementById('gpt-description').value = '';
    document.getElementById('gpt-instructions').value = '';
    document.getElementById('lead-name').value = '';
    document.getElementById('lead-email').value = '';
    switchView(1);
};

// Utilities
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

console.log('Profit Lab Skill Builder Initialized');
