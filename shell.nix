let
  pkgs = import <nixpkgs> { };
in
pkgs.mkShell {
  name = "env";
  buildInputs = with pkgs; [
    nodejs
    pnpm
    tree-sitter
    emscripten
    go
    rustc
    cargo
    python3
    python3Packages.pip
  ] ++ pkgs.lib.optionals pkgs.stdenv.isLinux [ gdb valgrind ];
  shellHook = ''
    export CXXFLAGS="-std=c++20"
    export NODE_NO_WARNINGS=1
  '';
}
