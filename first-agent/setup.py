#!/usr/bin/env python3
"""
Setup script for QA Context Generator

This script helps users set up the QA Context Generator application.
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="qa-context-generator",
    version="1.0.0",
    author="QA Context Generator Team",
    author_email="team@qa-context-generator.com",
    description="CrewAI-powered QA testing context generator",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/your-username/qa-context-generator",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Software Development :: Quality Assurance",
        "Topic :: Software Development :: Testing",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "qa-context-generator=cli:app",
        ],
    },
    include_package_data=True,
    zip_safe=False,
) 