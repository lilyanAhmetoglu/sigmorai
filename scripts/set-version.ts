// Called by semantic-release (prepareCmd). Writes the release version into
// package.json so the footer/build metadata and the git tag always agree.
const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error(`set-version: expected a semver argument, got "${version ?? ''}"`);
  process.exit(1);
}

const pkg = await Bun.file('package.json').json();
pkg.version = version;
await Bun.write('package.json', JSON.stringify(pkg, null, 2) + '\n');

console.log(`set-version: ${version}`);

export {};
