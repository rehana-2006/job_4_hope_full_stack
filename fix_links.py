import os

def fix_links():
    # Define root directory
    root_dir = os.path.join(os.getcwd(), 'frontend')
    
    count = 0
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.html'):
                filepath = os.path.join(dirpath, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace variations of index.html links with root /
                new_content = content.replace('href="./index.html"', 'href="/"')
                new_content = new_content.replace('href="../index.html"', 'href="/"')
                new_content = new_content.replace('href="index.html"', 'href="/"')
                
                if content != new_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed: {filename}")
                    count += 1
    
    print(f"Total files fixed: {count}")

if __name__ == "__main__":
    fix_links()
