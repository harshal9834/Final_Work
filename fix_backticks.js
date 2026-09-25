const fs = require('fs');
const path = require('path');

function fixFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixFiles(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            // Fix fetch(${import...}) -> fetch(`${import...}`)
            const regex1 = /fetch\(\$\{import\.meta\.env\.(.*?)\}(.*?)\)/g;
            if (regex1.test(content)) {
                content = content.replace(regex1, 'fetch(`${import.meta.env.$1}$2`)');
                changed = true;
            }
            
            const regex2 = /\(\{import\.meta\.env\.(.*?)\}(.*?)\)/g;
            if (regex2.test(content)) {
                 // handle any other missing backticks
            }
            
            // Let's just do a generic replacement for ${import.meta.env.XXX} without backticks
            const regex3 = /([^`])\$\{import\.meta\.env\.([A-Z_]+)\}([^`\n\r]*)/g;
            // Actually, we know exactly what we broke:
            // `${import.meta.env.VITE_API_URL}/api/system/startup-state` became ${import.meta.env.VITE_API_URL}/api/system/startup-state
            // `${import.meta.env.VITE_API_URL}/api/faults?active=true` became ...
            // let's just find \$\{import\.meta\.env\.[A-Z_]+\}[^)]* and wrap it in backticks if it isn't.
            
            const lines = content.split('\n');
            for(let i=0; i<lines.length; i++) {
                if (lines[i].includes('${import.meta.env.') && !lines[i].includes('`')) {
                    lines[i] = lines[i].replace(/\$\{import\.meta\.env\.[A-Z_]+\}[^),\]}]*/, (match) => {
                        return '`' + match + '`';
                    });
                    changed = true;
                }
            }

            if (changed) {
                fs.writeFileSync(fullPath, lines.join('\n'));
                console.log('Fixed', fullPath);
            }
        }
    }
}

fixFiles(path.join(__dirname, 'male_uav_frontend-', 'src'));
