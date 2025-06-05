with import <nixpkgs> {};
mkShell {
  packages = [
    nodejs
    corepack
  ];
}
