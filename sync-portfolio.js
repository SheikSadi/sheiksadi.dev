const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { PDFParse } = require('pdf-parse');

// Helper to split on commas but ignore commas inside parentheses (e.g. "Python (Expert, 4.5 yrs)")
function splitByCommasNotInParentheses(str) {
    const parts = [];
    let current = '';
    let parenCount = 0;
    for (let j = 0; j < str.length; j++) {
        const char = str[j];
        if (char === '(') parenCount++;
        else if (char === ')') parenCount--;
        
        if (char === ',' && parenCount === 0) {
            parts.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    if (current) {
        parts.push(current.trim());
    }
    return parts.filter(p => p.length > 0);
}

// 1. JSON Parser
function parseJSON(filePath) {
    console.log(`Parsing JSON file: ${filePath}...`);
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    
    // Normalize properties
    return {
        experiences: data.experience || data.experiences || [],
        skills: data.skills || data.stack || [],
        projects: data.projects || data.systems || []
    };
}

// 2. Markdown Parser
function parseMarkdown(filePath) {
    console.log(`Parsing Markdown file: ${filePath}...`);
    const mdText = fs.readFileSync(filePath, 'utf8');
    const sections = {};
    let currentSection = '';
    const lines = mdText.split('\n').map(l => l.trim());
    
    for (let line of lines) {
        if (line.startsWith('#')) {
            // Header
            const headerText = line.replace(/^#+\s*/, '').toLowerCase();
            if (headerText.includes('experience')) {
                currentSection = 'experience';
            } else if (headerText.includes('project') || headerText.includes('system')) {
                currentSection = 'projects';
            } else if (headerText.includes('skill') || headerText.includes('stack')) {
                currentSection = 'skills';
            } else {
                currentSection = '';
            }
            continue;
        }
        
        if (!currentSection) continue;
        if (!sections[currentSection]) sections[currentSection] = [];
        sections[currentSection].push(line);
    }
    
    const result = {
        experiences: [],
        skills: [],
        projects: []
    };
    
    // Parse Experience section
    if (sections.experience) {
        let currentExp = null;
        for (let line of sections.experience) {
            if (line.startsWith('-') || line.startsWith('*')) {
                if (currentExp) result.experiences.push(currentExp);
                
                const content = line.replace(/^[-*]\s*/, '');
                const parts = content.split('|').map(p => p.trim());
                
                let date = '';
                let role = '';
                let org = '';
                
                if (parts.length >= 3) {
                    date = parts[0].replace(/\*\*|\*/g, '');
                    role = parts[1].replace(/\*\*|\*/g, '');
                    org = parts[2].replace(/\*\*|\*/g, '');
                } else if (parts.length === 2) {
                    date = parts[0].replace(/\*\*|\*/g, '');
                    role = parts[1].replace(/\*\*|\*/g, '');
                } else {
                    role = content.replace(/\*\*|\*/g, '');
                }
                
                currentExp = { date, role, org, bullets: [] };
            } else if (line.trim().length > 0 && currentExp) {
                currentExp.bullets.push(line);
            }
        }
        if (currentExp) result.experiences.push(currentExp);
    }
    
    // Parse Projects section
    if (sections.projects) {
        let currentProj = null;
        for (let line of sections.projects) {
            if (line.startsWith('-') || line.startsWith('*')) {
                if (currentProj) result.projects.push(currentProj);
                
                const content = line.replace(/^[-*]\s*/, '');
                const parts = content.split('|').map(p => p.trim());
                
                let title = '';
                let metric = '';
                let tags = [];
                let tech = [];
                
                if (parts.length > 0) {
                    title = parts[0].replace(/\*\*|\*/g, '');
                }
                if (parts.length > 1) {
                    metric = parts[1].replace(/\*\*|\*/g, '');
                    if (metric.toLowerCase().startsWith('tags:') || metric.toLowerCase().startsWith('tech:')) {
                        metric = ''; // Omitted, next parts are tags/tech
                    }
                }
                
                parts.forEach(part => {
                    const lPart = part.toLowerCase();
                    if (lPart.startsWith('tags:')) {
                        tags = part.replace(/^tags:\s*/i, '').split(',').map(t => t.trim());
                    } else if (lPart.startsWith('tech:')) {
                        tech = part.replace(/^tech:\s*/i, '').split(',').map(t => t.trim());
                    }
                });
                
                currentProj = { title, metric, tags, tech, desc: '' };
            } else if (line.trim().length > 0 && currentProj) {
                currentProj.desc += (currentProj.desc ? ' ' : '') + line;
            }
        }
        if (currentProj) result.projects.push(currentProj);
    }
    
    // Parse Skills section
    if (sections.skills) {
        let currentGroup = null;
        for (let line of sections.skills) {
            if (line.startsWith('###')) {
                if (currentGroup) result.skills.push(currentGroup);
                const category = line.replace(/^###\s*/, '').trim();
                currentGroup = { category, items: [] };
            } else if (line.trim().length > 0) {
                if (currentGroup) {
                    const items = splitByCommasNotInParentheses(line);
                    currentGroup.items.push(...items);
                }
            }
        }
        if (currentGroup) result.skills.push(currentGroup);
    }
    
    return result;
}

// 3. PDF Heuristic Parser (Supports LinkedIn standard PDF & custom Resume layouts)
async function parsePDFFile(filePath) {
    console.log(`Parsing PDF file: ${filePath}...`);
    const dataBuffer = fs.readFileSync(filePath);
    const instance = new PDFParse({ data: dataBuffer });
    const pdfData = await instance.getText();
    const text = pdfData.text;
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let currentSection = '';
    const sections = {
        experience: [],
        skills: [],
        projects: []
    };
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const upper = line.toUpperCase();
        
        if (upper === 'PROFESSIONAL EXPERIENCE' || upper === 'EXPERIENCE' || upper === 'WORK EXPERIENCE') {
            currentSection = 'experience';
            continue;
        } else if (upper === 'TECHNICAL SKILLS' || upper === 'SKILLS' || upper === 'TOP SKILLS' || upper === 'STACK') {
            currentSection = 'skills';
            continue;
        } else if (upper === 'PROJECTS' || upper === 'PERSONAL PROJECTS' || upper === 'SELECTED PROJECTS') {
            currentSection = 'projects';
            continue;
        } else if (['PROFILE', 'SUMMARY', 'EDUCATION', 'LANGUAGES', 'CERTIFICATIONS', 'ORGANIZATIONS', 'HONORS'].includes(upper)) {
            currentSection = '';
            continue;
        }
        
        if (currentSection) {
            sections[currentSection].push(line);
        }
    }
    
    const result = {
        experiences: [],
        skills: [],
        projects: []
    };
    
    // Experience parser
    const expLines = sections.experience;
    let currentExp = null;
    
    // Dates regex covering: Jan 2026 – Present, Jun 2026 - Present, 2025–26, 2024–2025
    const dateRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*[-–—]\s*(?:Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})|\d{4}\s*[-–—]\s*\d{4}|\d{4}\s*[-–—]\s*(?:Present)?/i;
    const linkedinDateRegex = /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s*[-–—]\s*(?:Present|\w+\s+\d{4})(?:\s*\(.*?\))?/i;
    
    for (let i = 0; i < expLines.length; i++) {
        const line = expLines[i];
        const hasDate = dateRegex.test(line);
        const hasDash = line.includes('—') || line.includes('-');
        const hasLinkedinDate = linkedinDateRegex.test(line);
        
        if (hasDate && (hasDash || line.includes('\t') || line.includes('  '))) {
            // New Experience: Custom resume style
            if (currentExp) result.experiences.push(currentExp);
            
            const dateMatch = line.match(dateRegex);
            const dateStr = dateMatch ? dateMatch[0].trim() : '';
            
            let headerWithoutDate = line;
            if (dateMatch) {
                headerWithoutDate = line.replace(dateRegex, '').trim();
            }
            
            let role = '';
            let org = '';
            
            if (headerWithoutDate.includes('—')) {
                const parts = headerWithoutDate.split('—');
                role = parts[0].trim();
                org = parts.slice(1).join('—').trim();
            } else if (headerWithoutDate.includes(' - ')) {
                const parts = headerWithoutDate.split(' - ');
                role = parts[0].trim();
                org = parts.slice(1).join(' - ').trim();
            } else {
                role = headerWithoutDate;
                org = '';
            }
            
            currentExp = { date: dateStr, role, org, bullets: [] };
        } else if (hasLinkedinDate) {
            // New Experience: Standard LinkedIn export style
            if (currentExp) result.experiences.push(currentExp);
            
            const dateStr = line.match(linkedinDateRegex)[0].trim();
            let role = 'Software Engineer';
            let org = '';
            
            if (i >= 1) {
                role = expLines[i-1];
                if (result.experiences.length > 0) {
                    const prev = result.experiences[result.experiences.length - 1];
                    prev.bullets = prev.bullets.filter(b => b !== role);
                }
            }
            if (i >= 2) {
                org = expLines[i-2];
                if (result.experiences.length > 0) {
                    const prev = result.experiences[result.experiences.length - 1];
                    prev.bullets = prev.bullets.filter(b => b !== org);
                }
            }
            
            if (role.toUpperCase().includes('EXPERIENCE')) role = 'Role';
            
            currentExp = { date: dateStr, role, org, bullets: [] };
        } else {
            if (currentExp) {
                currentExp.bullets.push(line);
            }
        }
    }
    if (currentExp) result.experiences.push(currentExp);
    
    // Clean up Experience bullets (ignore pages and separators)
    result.experiences.forEach(exp => {
        exp.bullets = exp.bullets.filter(b => !b.startsWith('--') && !b.toLowerCase().includes('page') && b.trim() !== '');
    });
    
    // Skills parser
    const skillLines = sections.skills;
    for (let i = 0; i < skillLines.length; i++) {
        const line = skillLines[i];
        let category = '';
        let listStr = '';
        
        if (line.includes('\t')) {
            const parts = line.split('\t');
            category = parts[0].trim();
            listStr = parts.slice(1).join('\t').trim();
        } else if (line.includes('   ')) {
            const parts = line.split(/\s{3,}/);
            category = parts[0].trim();
            listStr = parts.slice(1).join(', ').trim();
        } else if (line.includes(':')) {
            const parts = line.split(':');
            category = parts[0].trim();
            listStr = parts.slice(1).join(':').trim();
        } else {
            category = line;
            listStr = '';
        }
        
        if (category && listStr) {
            const items = splitByCommasNotInParentheses(listStr);
            result.skills.push({ category, items });
        } else if (category && !listStr && i + 1 < skillLines.length && !skillLines[i+1].includes('\t') && !skillLines[i+1].includes(':')) {
            const nextLine = skillLines[i+1];
            const items = splitByCommasNotInParentheses(nextLine);
            result.skills.push({ category, items });
            i++;
        }
    }
    
    // Projects parser
    const projLines = sections.projects;
    let currentProj = null;
    for (let i = 0; i < projLines.length; i++) {
        const line = projLines[i];
        if (line.length < 50 && !line.includes('.') && !line.includes(',')) {
            if (currentProj) result.projects.push(currentProj);
            currentProj = { title: line, metric: '', tags: [], tech: [], desc: '' };
        } else if (currentProj) {
            currentProj.desc += (currentProj.desc ? ' ' : '') + line;
        }
    }
    if (currentProj) result.projects.push(currentProj);
    
    return result;
}

// 4. Inject sections back into index.html safely using cheerio
function updateIndexHtml(parsedData) {
    const indexPath = path.join(__dirname, 'index.html');
    if (!fs.existsSync(indexPath)) {
        console.error("Error: index.html not found in the current directory!");
        process.exit(1);
    }
    
    console.log("Loading index.html...");
    let htmlContent = fs.readFileSync(indexPath, 'utf8');
    const $ = cheerio.load(htmlContent, { decodeEntities: false });
    
    // UPDATE EXPERIENCE SECTION
    if (parsedData.experiences && parsedData.experiences.length > 0) {
        console.log(`Injecting ${parsedData.experiences.length} experience entries...`);
        const $timeline = $('.timeline');
        if ($timeline.length > 0) {
            $timeline.empty();
            $timeline.append('\n');
            parsedData.experiences.forEach(exp => {
                let descHtml = '';
                if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
                    descHtml = `<p>${exp.bullets.join(' ')}</p>`;
                } else if (typeof exp.desc === 'string' && exp.desc) {
                    descHtml = `<p>${exp.desc}</p>`;
                } else if (typeof exp.description === 'string' && exp.description) {
                    descHtml = `<p>${exp.description}</p>`;
                }
                
                const expHtml = `        <div class="tl-row">
          <span class="tl-date">${exp.date}</span>
          <div class="tl-content">
            <h3>${exp.role}</h3>
            <p class="tl-org">${exp.org}</p>
            ${descHtml}
          </div>
        </div>\n`;
                $timeline.append(expHtml);
            });
            $timeline.append('      '); // correct final spacing
        } else {
            console.warn("Warning: .timeline element not found in index.html");
        }
    } else {
        console.log("No experience entries found to update. Preserving existing timeline.");
    }
    
    // UPDATE SKILLS SECTION
    if (parsedData.skills && parsedData.skills.length > 0) {
        console.log(`Injecting ${parsedData.skills.length} skill groups...`);
        const $stackGrid = $('.stack-grid');
        if ($stackGrid.length > 0) {
            $stackGrid.empty();
            $stackGrid.append('\n');
            parsedData.skills.forEach(skillGroup => {
                const listStr = skillGroup.items.map(item => `[ ${item} ]`).join(' ');
                const groupHtml = `        <div class="stack-group">
          <h3>${skillGroup.category}</h3>
          <p class="stack-list">${listStr}</p>
        </div>\n`;
                $stackGrid.append(groupHtml);
            });
            $stackGrid.append('      '); // correct final spacing
        } else {
            console.warn("Warning: .stack-grid element not found in index.html");
        }
    } else {
        console.log("No skills found to update. Preserving existing stack-grid.");
    }
    
    // UPDATE PROJECTS SECTION
    if (parsedData.projects && parsedData.projects.length > 0) {
        console.log(`Injecting ${parsedData.projects.length} project cards...`);
        const $cardGrid = $('.card-grid');
        if ($cardGrid.length > 0) {
            $cardGrid.empty();
            $cardGrid.append('\n');
            parsedData.projects.forEach(proj => {
                const dataTags = Array.isArray(proj.tags) ? proj.tags.join(' ') : '';
                const metricHtml = proj.metric ? `<span class="card-metric">${proj.metric}</span>` : '';
                
                let techHtml = '';
                if (Array.isArray(proj.tech) && proj.tech.length > 0) {
                    techHtml = `\n          <ul class="card-tags">\n            ` + 
                        proj.tech.map(t => `<li>${t}</li>`).join('') + 
                        `\n          </ul>`;
                }
                
                const projHtml = `        <article class="card" data-tags="${dataTags}">
          <div class="card-top">
            <h3>${proj.title}</h3>
            ${metricHtml}
          </div>
          <p>${proj.desc || proj.description || ''}</p>${techHtml}
        </article>\n`;
                $cardGrid.append(projHtml);
            });
            $cardGrid.append('      '); // correct final spacing
        } else {
            console.warn("Warning: .card-grid element not found in index.html");
        }
        
        // UPDATE PROJECT FILTER BAR DYNAMICALLY
        const $filterBar = $('.filter-bar');
        if ($filterBar.length > 0) {
            const allTags = new Set();
            parsedData.projects.forEach(proj => {
                if (Array.isArray(proj.tags)) {
                    proj.tags.forEach(t => {
                        if (t) allTags.add(t.toLowerCase().trim());
                    });
                }
            });
            
            if (allTags.size > 0) {
                console.log("Updating filter bar with tags:", Array.from(allTags));
                $filterBar.empty();
                $filterBar.append('\n        <button class="filter-btn active" data-filter="all">All</button>');
                allTags.forEach(tag => {
                    const label = ['ML', 'RAG', 'PII', 'NLP', 'AI', 'GCP', 'AWS', 'JWKS'].includes(tag.toUpperCase()) 
                        ? tag.toUpperCase() 
                        : tag.charAt(0).toUpperCase() + tag.slice(1);
                    $filterBar.append(`\n        <button class="filter-btn" data-filter="${tag}">${label}</button>`);
                });
                $filterBar.append('\n      ');
            }
        }
    } else {
        console.log("No projects found to update. Preserving existing projects.");
    }
    
    // Save updated HTML back to index.html
    fs.writeFileSync(indexPath, $.html(), 'utf8');
    console.log("Successfully updated index.html!");
}

// Main execution flow
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log(`
Usage:
  node sync-portfolio.js <input-file>

Supported Formats:
  1. JSON (.json): E.g., node sync-portfolio.js portfolio.json
  2. Markdown (.md): E.g., node sync-portfolio.js portfolio.md
  3. PDF (.pdf): E.g., node sync-portfolio.js resume.pdf (Parses standard LinkedIn 'Save to PDF' or Resume formats)

Example:
  node sync-portfolio.js resume.pdf
        `);
        process.exit(0);
    }
    
    const filePath = path.resolve(args[0]);
    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found at "${filePath}"`);
        process.exit(1);
    }
    
    const ext = path.extname(filePath).toLowerCase();
    let parsedData;
    
    try {
        if (ext === '.json') {
            parsedData = parseJSON(filePath);
        } else if (ext === '.md' || ext === '.markdown') {
            parsedData = parseMarkdown(filePath);
        } else if (ext === '.pdf') {
            parsedData = await parsePDFFile(filePath);
        } else {
            console.error(`Error: Unsupported file extension "${ext}". Use .json, .md, or .pdf`);
            process.exit(1);
        }
        
        updateIndexHtml(parsedData);
        
    } catch (err) {
        console.error("An error occurred during portfolio synchronization:", err);
        process.exit(1);
    }
}

main();
