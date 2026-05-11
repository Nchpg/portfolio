{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
  ];

  shellHook = ''
    export PATH="$PWD/node_modules/.bin:$PATH"
    # Utilise un cache local pour éviter les problèmes de permission avec ~/.npm sur NixOS
    export npm_config_cache="$PWD/.npm-cache"
    
    echo "--- React + NixOS Dev Shell ---"
    echo "Node: $(node -v)"
    echo "NPM:  $(npm -v)"
    echo "-------------------------------"
    echo "You can now run 'npm install' and 'npm start'"
  '';
}
