#!/bin/bash
set -e
echo "🚀 Instalando dependencias y configurando Ónix-0..."
sudo apt update && sudo apt install -y python3-pip python3-venv ufw iptables postgresql postgresql-contrib nginx git curl sqlite3
sudo mkdir -p /opt/onix0-server/{frontend,storage/maps,database,nginx}
echo "Instalación base completada."
