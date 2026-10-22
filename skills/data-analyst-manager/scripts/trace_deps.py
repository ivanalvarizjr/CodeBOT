## 6. Script Python (Pendukung Path Tracing)

import ast, os, json, sys

def extract_imports(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read(), filename=filepath)
    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name.split(".")[0])
        elif isinstance(node, ast.ImportFrom) and node.module:
            imports.add(node.module.split(".")[0])
    return imports

def build_graph(root, max_depth=3):
    graph = {}
    for dirpath, _, filenames in os.walk(root):
        for fn in filenames:
            if fn.endswith(".py"):
                fp = os.path.join(dirpath, fn)
                rel = os.path.relpath(fp, root)
                graph[rel] = list(extract_imports(fp))
    return graph

if __name__ == "__main__":
    root = sys.argv[1] if len(sys.argv) > 1 else "."
    depth = int(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[2] == "--depth" else 3
    print(json.dumps(build_graph(root, depth), indent=2))