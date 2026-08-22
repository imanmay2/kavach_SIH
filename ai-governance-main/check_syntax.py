
import sys

def check_balance(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    braces = 0
    brackets = 0
    parens = 0
    
    for char in content:
        if char == '{': braces += 1
        elif char == '}': braces -= 1
        elif char == '[': brackets += 1
        elif char == ']': brackets -= 1
        elif char == '(': parens += 1
        elif char == ')': parens -= 1
    
    print(f"Braces: {braces}")
    print(f"Brackets: {brackets}")
    print(f"Parens: {parens}")

if __name__ == "__main__":
    check_balance(sys.argv[1])
