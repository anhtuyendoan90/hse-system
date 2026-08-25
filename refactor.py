import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to find cases of `db.XXX` and if it ends with `.get()`, `.all()`, or `.run()`, we prepend `await `.
    # But it might be nested, e.g. `db.select().from(users).where(eq(users.id, 1)).get()`
    # Let's match `db.` and the rest of the chain.
    # Since regex is hard for nested parentheses, we can just replace the specific end calls if they are part of a db chain.
    # Actually, simpler: replace `db.` with `await db.` if it is followed by `.get()`, `.all()`, `.run()`.
    # Wait, the `await` needs to be in front of `db.`, not at the end.
    
    # Regex approach:
    # Find all occurrences of `db.` that are not preceded by `await `
    # Check if the line contains `.get()`, `.all()`, or `.run()`
    lines = content.split('\n')
    changed = False
    for i in range(len(lines)):
        line = lines[i]
        if 'db.' in line and ('.get()' in line or '.all()' in line or '.run()' in line):
            # check if it already has await
            if 'await db.' not in line:
                # Add await
                lines[i] = line.replace('db.', 'await db.')
                changed = True
                
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            process_file(os.path.join(root, file))

for root, dirs, files in os.walk('scripts'):
    for file in files:
        if file.endswith('.ts'):
            process_file(os.path.join(root, file))
