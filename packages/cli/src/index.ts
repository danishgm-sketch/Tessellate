#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('tess')
  .description('Tessellate CLI — interface intelligence for humans and agents')
  .version('0.1.0');

export default program;
