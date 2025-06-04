#!/usr/bin/env bun

import { readFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import { checkbox, select } from '@inquirer/prompts';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface DocMapping {
  [key: string]: {
    full: string;
    tiny: string;
  };
}

async function readPackageJson(): Promise<PackageJson> {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(packageJsonContent);
  } catch (error) {
    console.error('Error: Could not read package.json file');
    process.exit(1);
  }
}

async function readDocMapping(): Promise<DocMapping> {
  try {
    const mappingPath = join(import.meta.dir, 'docs', 'mapping.json');
    const mappingContent = readFileSync(mappingPath, 'utf-8');
    return JSON.parse(mappingContent);
  } catch (error) {
    console.error('Error: Could not read mapping.json file');
    return {};
  }
}

function getAllDependencies(pkg: PackageJson): string[] {
  const deps = new Set<string>();
  
  if (pkg.dependencies) {
    Object.keys(pkg.dependencies).forEach(dep => deps.add(dep));
  }
  if (pkg.devDependencies) {
    Object.keys(pkg.devDependencies).forEach(dep => deps.add(dep));
  }
  if (pkg.peerDependencies) {
    Object.keys(pkg.peerDependencies).forEach(dep => deps.add(dep));
  }
  
  return Array.from(deps);
}

async function copyDocFile(packageName: string, docMapping: DocMapping, version: 'full' | 'tiny') {
  const docVersions = docMapping[packageName];
  if (!docVersions) {
    console.log(`  ❌ No documentation available for ${packageName}`);
    return;
  }

  const docFileName = docVersions[version];
  const sourcePath = join(import.meta.dir, 'docs', docFileName);
  const targetDir = join(process.cwd(), '.llm-docs');
  const targetPath = join(targetDir, docFileName);

  try {
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }
    copyFileSync(sourcePath, targetPath);
    console.log(`  ✅ Copied ${version} documentation for ${packageName}`);
  } catch (error) {
    console.error(`  ❌ Failed to copy documentation for ${packageName}:`, error);
  }
}

async function selectPackages(availableDeps: string[], docMapping: DocMapping): Promise<Array<{ name: string; version: 'full' | 'tiny' }>> {
  const packagesWithDocs = availableDeps.filter(dep => docMapping[dep]);
  
  if (packagesWithDocs.length === 0) {
    console.log('No documentation available for any of your dependencies.');
    return [];
  }

  const choices = packagesWithDocs.map(dep => ({
    name: dep,
    value: dep,
    checked: true
  }));

  const selectedPackages = await checkbox({
    message: 'Select packages to copy documentation for:',
    choices
  });

  const result: Array<{ name: string; version: 'full' | 'tiny' }> = [];
  
  for (const pkg of selectedPackages) {
    const version = await select({
      message: `Select documentation version for ${pkg}:`,
      choices: [
        { name: 'Full Documentation', value: 'full' },
        { name: 'Tiny Documentation', value: 'tiny' }
      ]
    }) as 'full' | 'tiny';
    
    result.push({ name: pkg, version });
  }

  return result;
}

async function main() {
  console.log('📚 LLM Documentation Generator\n');
  
  // Read package.json and mapping
  const pkg = await readPackageJson();
  const docMapping = await readDocMapping();
  
  // Get all dependencies
  const allDeps = getAllDependencies(pkg);
  
  // Display available documentation
  console.log('Your dependencies:');
  allDeps.forEach(dep => {
    const hasDoc = docMapping[dep] ? '✅' : '❌';
    console.log(`${hasDoc} ${dep}`);
  });
  
  // Let user select packages and versions
  const selectedPackages = await selectPackages(allDeps, docMapping);
  
  if (selectedPackages.length === 0) {
    console.log('\nNo packages selected. Exiting...');
    return;
  }

  // Copy selected documentation
  console.log('\nCopying selected documentation...\n');
  for (const { name, version } of selectedPackages) {
    await copyDocFile(name, docMapping, version);
  }
  
  console.log('\n✨ Documentation has been copied to the `.llm-docs` directory in your project.');
  console.log('You can now use these files as reference for AI tools like Cursor.');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
