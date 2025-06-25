#!/bin/bash

# Check if commit message is provided
if [ -z "$1" ]
then
  echo "Ecommerce are successfully push commit"
  exit 1
fi

# Run Git commands
git add .
git commit -m "$1"
git push
