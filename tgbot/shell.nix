{ pkgs ? import <nixpkgs> {} }:

let
  runtimeLibs = with pkgs; [
    openssl
  ];
in
pkgs.mkShell {
  buildInputs = runtimeLibs ++ (with pkgs; [
    pkg-config
    # rustc cargo
  ]);

  shellHook = ''
    export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath runtimeLibs}:$LD_LIBRARY_PATH

    export OPENSSL_DIR=${pkgs.openssl.dev}
    export OPENSSL_LIB_DIR=${pkgs.openssl.out}/lib
    export OPENSSL_INCLUDE_DIR=${pkgs.openssl.dev}/include

    export PKG_CONFIG_PATH=${pkgs.openssl.dev}/lib/pkgconfig:$PKG_CONFIG_PATH

    echo "LD_LIBRARY_PATH for teloxide:"
    echo "$LD_LIBRARY_PATH" | tr ':' '\n'
  '';
}