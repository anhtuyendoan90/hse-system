import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const sourceFiles = project.getSourceFiles(['src/**/*.ts', 'src/**/*.tsx', 'scripts/**/*.ts']);

let totalChanges = 0;

for (const sourceFile of sourceFiles) {
  let fileChanged = false;
  
  // Find all db queries
  const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
  const replacements: { start: number; end: number; text: string }[] = [];
  
  for (const callExpr of callExpressions) {
    const text = callExpr.getText();
    if (text.startsWith('db.') || text.includes(' db.')) {
      if (text.endsWith('.get()') || text.endsWith('.all()') || text.endsWith('.run()')) {
        const parent = callExpr.getParent();
        if (parent && parent.getKind() !== SyntaxKind.AwaitExpression) {
          replacements.push({
            start: callExpr.getStart(),
            end: callExpr.getEnd(),
            text: `await ${text}`
          });
        }
      }
    }
  }

  // Sort replacements in reverse order to not mess up indices
  replacements.sort((a, b) => b.start - a.start);

  for (const rep of replacements) {
    sourceFile.replaceText([rep.start, rep.end], rep.text);
    fileChanged = true;
    totalChanges++;
  }

  if (fileChanged) {
    // Now make sure functions containing 'await' are async
    let asyncChanges = true;
    while (asyncChanges) {
      asyncChanges = false;
      const awaits = sourceFile.getDescendantsOfKind(SyntaxKind.AwaitExpression);
      for (const aw of awaits) {
        let current: any = aw;
        let functionFound = false;
        while (current) {
          const kind = current.getKind();
          if (
            kind === SyntaxKind.FunctionDeclaration ||
            kind === SyntaxKind.MethodDeclaration ||
            kind === SyntaxKind.ArrowFunction ||
            kind === SyntaxKind.FunctionExpression
          ) {
            if (!current.isAsync()) {
              current.setIsAsync(true);
              asyncChanges = true;
              functionFound = true;
            }
            break;
          }
          current = current.getParent();
        }
        if (functionFound) break; // Break the outer loop to re-evaluate awaits
      }
    }
  }
}

project.saveSync();
console.log(`Made ${totalChanges} changes.`);
