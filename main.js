import JSZip from 'jszip';

// State Management
let currentStep = 1;
const skillData = {
    name: '',
    description: '',
    instructions: '',
    slug: ''
};

// DOM Elements
const views = {
    1: document.getElementById('view-step-1'),
    2: document.getElementById('view-step-2'),
    3: document.getElementById('view-step-3')
};
const indicators = document.querySelectorAll('.indicator-item');

// Navigation Functions
window.nextStep = (step) => {
    if (step === 2) {
        const name = document.getElementById('gpt-name').value;
        const desc = document.getElementById('gpt-description').value;
        if (!name || !desc) {
            alert('Please fill in both the skill name and description.');
            return;
        }
        skillData.name = name;
        skillData.description = desc;
        skillData.slug = slugify(name);
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
    // Update Views
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[step].classList.add('active');
    
    // Update Indicators
    indicators.forEach(ind => {
        const s = parseInt(ind.dataset.step);
        ind.classList.toggle('active', s === step);
    });
    
    currentStep = step;
    window.scrollTo(0, document.getElementById('converter').offsetTop - 100);
}

// Synthesis Logic
window.synthesizeSkill = async () => {
    const instructions = document.getElementById('gpt-instructions').value;
    if (!instructions) {
        alert('Please provide instructions to synthesize.');
        return;
    }
    skillData.instructions = instructions;

    // Simulate "Synthesis" process for premium feel
    const button = document.querySelector('.cta-button.glow');
    const originalText = button.innerText;
    button.disabled = true;
    button.innerText = 'Synthesizing Components...';
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    button.innerText = 'Analyzing Logic Gates...';
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate Preview
    const skillContent = generateSkillMarkdown();
    document.getElementById('skill-preview').innerText = skillContent;
    document.getElementById('slug-name').innerText = skillData.slug;
    
    button.innerText = originalText;
    button.disabled = false;
    
    switchView(3);
};

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
    
    // Add SKILL.md
    skillFolder.file("SKILL.md", generateSkillMarkdown());
    
    // Generate and trigger download
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
    switchView(1);
};

// Utilities
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-');         // Replace multiple - with single -
}

// Initialize
console.log('Profit Lab Skill Builder Initialized');
