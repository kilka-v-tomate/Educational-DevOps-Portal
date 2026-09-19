/**
 * Сервис терминала - эмуляция командной строки Linux
 */

import { TerminalState, FileSystemNode, CommandResult, TerminalCommand, TerminalLab } from '../types';

class TerminalService {
  /**
   * Создание начального состояния терминала
   */
  createInitialState(): TerminalState {
    const rootDir: FileSystemNode = {
      name: '/',
      type: 'directory',
      children: [
        {
          name: 'home',
          type: 'directory',
          parent: undefined,
          children: [
            {
              name: 'student',
              type: 'directory',
              parent: undefined,
              children: [
                {
                  name: 'projects',
                  type: 'directory',
                  parent: undefined,
                  children: []
                },
                {
                  name: 'documents',
                  type: 'directory',
                  parent: undefined,
                  children: []
                }
              ]
            }
          ]
        },
        {
          name: 'etc',
          type: 'directory',
          parent: undefined,
          children: [
            {
              name: 'passwd',
              type: 'file',
              content: 'root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000:student:/home/student:/bin/bash'
            }
          ]
        },
        {
          name: 'var',
          type: 'directory',
          parent: undefined,
          children: [
            {
              name: 'log',
              type: 'directory',
              parent: undefined,
              children: [
                {
                  name: 'syslog',
                  type: 'file',
                  content: 'Jan 1 00:00:01 localhost systemd[1]: Started Daily apt download activities.'
                }
              ]
            }
          ]
        },
        {
          name: 'tmp',
          type: 'directory',
          parent: undefined,
          children: []
        },
        {
          name: 'usr',
          type: 'directory',
          parent: undefined,
          children: [
            {
              name: 'bin',
              type: 'directory',
              parent: undefined,
              children: []
            }
          ]
        }
      ]
    };

    // Установка родительских ссылок
    this.setParentReferences(rootDir);

    const homeDir = this.resolvePath('/home/student', rootDir) as FileSystemNode;

    return {
      currentDir: '/home/student',
      homeDir: '/home/student',
      history: [],
      historyIndex: -1,
      fileSystem: rootDir,
      environment: {
        USER: 'student',
        HOME: '/home/student',
        PWD: '/home/student',
        SHELL: '/bin/bash',
        PATH: '/usr/bin:/bin:/usr/sbin:/sbin',
        HOSTNAME: 'devops-portal'
      },
      lastOutput: '',
      lastCommand: '',
      commandHistory: []
    };
  }

  /**
   * Установка родительских ссылок для узлов файловой системы
   */
  private setParentReferences(node: FileSystemNode, parent?: FileSystemNode): void {
    node.parent = parent;
    if (node.children) {
      for (const child of node.children) {
        this.setParentReferences(child, node);
      }
    }
  }

  /**
   * Выполнение команды
   */
  executeCommand(command: string, state: TerminalState): CommandResult {
    const trimmed = command.trim();
    
    if (!trimmed) {
      return { success: true, output: '' };
    }

    state.lastCommand = trimmed;
    state.environment.PWD = state.currentDir;

    const parts = trimmed.split(/\s+/);
    const cmdName = parts[0];
    const args = parts.slice(1);

    // Добавление в историю
    state.history.push(trimmed);
    state.historyIndex = state.history.length;
    state.commandHistory.push({
      command: trimmed,
      output: '',
      timestamp: Date.now()
    });

    const result = this.executeCommandByName(cmdName, args, state);
    
    if (state.commandHistory.length > 0) {
      state.commandHistory[state.commandHistory.length - 1].output = result.output;
    }

    state.lastOutput = result.output;

    return result;
  }

  /**
   * Выполнение команды по имени
   */
  private executeCommandByName(name: string, args: string[], state: TerminalState): CommandResult {
    switch (name) {
      case 'pwd':
        return this.cmdPwd(args, state);
      case 'ls':
        return this.cmdLs(args, state);
      case 'cd':
        return this.cmdCd(args, state);
      case 'mkdir':
        return this.cmdMkdir(args, state);
      case 'touch':
        return this.cmdTouch(args, state);
      case 'rm':
        return this.cmdRm(args, state);
      case 'cp':
        return this.cmdCp(args, state);
      case 'mv':
        return this.cmdMv(args, state);
      case 'cat':
        return this.cmdCat(args, state);
      case 'echo':
        return this.cmdEcho(args, state);
      case 'clear':
        return { success: true, output: '' };
      case 'help':
        return this.cmdHelp(args, state);
      case 'history':
        return this.cmdHistory(args, state);
      case 'whoami':
        return { success: true, output: state.environment.USER || 'student' };
      case 'date':
        return { success: true, output: new Date().toString() };
      case 'env':
        return this.cmdEnv(args, state);
      case 'grep':
        return this.cmdGrep(args, state);
      case 'head':
        return this.cmdHead(args, state);
      case 'tail':
        return this.cmdTail(args, state);
      case 'wc':
        return this.cmdWc(args, state);
      case 'man':
        return this.cmdMan(args, state);
      case 'chmod':
        return this.cmdChmod(args, state);
      case 'ps':
        return this.cmdPs(args, state);
      case 'ping':
        return this.cmdPing(args, state);
      case 'curl':
        return this.cmdCurl(args, state);
      default:
        return { 
          success: false, 
          output: '', 
          error: `${name}: command not found. Type 'help' for available commands.` 
        };
    }
  }

  private cmdPwd(_args: string[], state: TerminalState): CommandResult {
    return { success: true, output: state.currentDir };
  }

  private cmdLs(args: string[], state: TerminalState): CommandResult {
    const showHidden = args.includes('-a') || args.includes('-la');
    const pathArg = args.find(a => !a.startsWith('-')) || '.';
    
    const dir = this.resolvePath(pathArg, this.getRoot(state), state.currentDir);
    
    if (!dir || dir.type !== 'directory') {
      return { success: false, output: '', error: `ls: cannot access '${pathArg}': No such file or directory` };
    }

    let files = dir.children || [];
    if (!showHidden) {
      files = files.filter(f => !f.name.startsWith('.'));
    }

    const output = files.map(f => {
      if (f.type === 'directory') {
        return f.name + '/';
      }
      return f.name;
    }).join('  ');

    return { success: true, output: output || '(empty directory)' };
  }

  private cmdCd(args: string[], state: TerminalState): CommandResult {
    const target = args[0] || '~';
    
    let newPath: string;
    if (target === '~' || target === '$HOME') {
      newPath = state.homeDir;
    } else if (target === '..') {
      const parts = state.currentDir.split('/').filter(p => p);
      parts.pop();
      newPath = '/' + parts.join('/');
      if (newPath === '') newPath = '/';
    } else if (target === '.') {
      return { success: true, output: '' };
    } else if (target.startsWith('/')) {
      newPath = target;
    } else {
      newPath = state.currentDir === '/' 
        ? '/' + target 
        : state.currentDir + '/' + target;
    }

    // Нормализация пути
    newPath = this.normalizePath(newPath);

    const dir = this.resolvePath(newPath, this.getRoot(state));
    
    if (!dir || dir.type !== 'directory') {
      return { success: false, output: '', error: `cd: ${target}: No such file or directory` };
    }

    state.currentDir = newPath;
    return { success: true, output: '' };
  }

  private cmdMkdir(args: string[], state: TerminalState): CommandResult {
    const recursive = args.includes('-p');
    const dirNames = args.filter(a => a !== '-p');

    for (const dirName of dirNames) {
      const parentDir = this.resolvePath(state.currentDir, this.getRoot(state));
      if (!parentDir || parentDir.type !== 'directory') {
        return { success: false, output: '', error: `mkdir: cannot create directory '${dirName}'` };
      }

      const newDir: FileSystemNode = {
        name: dirName,
        type: 'directory',
        parent: parentDir,
        children: []
      };

      if (!parentDir.children) parentDir.children = [];
      parentDir.children.push(newDir);
    }

    return { success: true, output: '' };
  }

  private cmdTouch(args: string[], state: TerminalState): CommandResult {
    for (const fileName of args) {
      const parentDir = this.resolvePath(state.currentDir, this.getRoot(state));
      if (!parentDir || parentDir.type !== 'directory') {
        continue;
      }

      const existingFile = parentDir.children?.find(c => c.name === fileName);
      
      if (!existingFile) {
        const newFile: FileSystemNode = {
          name: fileName,
          type: 'file',
          content: '',
          parent: parentDir
        };

        if (!parentDir.children) parentDir.children = [];
        parentDir.children.push(newFile);
      }
    }

    return { success: true, output: '' };
  }

  private cmdRm(args: string[], state: TerminalState): CommandResult {
    const recursive = args.includes('-r') || args.includes('-R');
    const force = args.includes('-f');
    const targets = args.filter(a => !a.startsWith('-'));

    for (const target of targets) {
      const parentDir = this.resolvePath(state.currentDir, this.getRoot(state));
      if (!parentDir || !parentDir.children) continue;

      const index = parentDir.children.findIndex(c => c.name === target);
      if (index === -1) {
        if (!force) {
          return { success: false, output: '', error: `rm: cannot remove '${target}': No such file or directory` };
        }
        continue;
      }

      const node = parentDir.children[index];
      if (node.type === 'directory' && !recursive) {
        return { 
          success: false, 
          output: '', 
          error: `rm: cannot remove '${target}': Is a directory. Use -r to remove directories.` 
        };
      }

      parentDir.children.splice(index, 1);
    }

    return { success: true, output: '' };
  }

  private cmdCp(args: string[], _state: TerminalState): CommandResult {
    if (args.length < 2) {
      return { success: false, output: '', error: 'cp: missing file operand' };
    }
    // Упрощенная реализация
    return { success: true, output: `cp: copied ${args[0]} to ${args[1]}` };
  }

  private cmdMv(args: string[], _state: TerminalState): CommandResult {
    if (args.length < 2) {
      return { success: false, output: '', error: 'mv: missing file operand' };
    }
    // Упрощенная реализация
    return { success: true, output: `mv: moved ${args[0]} to ${args[1]}` };
  }

  private cmdCat(args: string[], state: TerminalState): CommandResult {
    for (const fileName of args) {
      const file = this.resolvePath(fileName, this.getRoot(state), state.currentDir);
      
      if (!file || file.type !== 'file') {
        return { success: false, output: '', error: `cat: ${fileName}: No such file or directory` };
      }

      return { success: true, output: file.content || '' };
    }

    return { success: false, output: '', error: 'cat: missing file operand' };
  }

  private cmdEcho(args: string[], _state: TerminalState): CommandResult {
    let output = args.join(' ');
    // Обработка кавычек
    output = output.replace(/^["']|["']$/g, '');
    return { success: true, output };
  }

  private cmdHelp(_args: string[], _state: TerminalState): CommandResult {
    const helpText = `Available commands:
  pwd       Print working directory
  ls        List directory contents
  cd        Change directory
  mkdir     Create directory
  touch     Create empty file
  rm        Remove files/directories
  cp        Copy files
  mv        Move/rename files
  cat       Display file contents
  echo      Print text
  clear     Clear terminal
  help      Show this help message
  history   Show command history
  whoami    Show current user
  date      Show current date/time
  env       Show environment variables
  grep      Search text in files
  head      Show first lines of file
  tail      Show last lines of file
  wc        Count words/lines/characters
  man       Show manual
  chmod     Change permissions
  ps        Show processes
  ping      Test network connectivity
  curl      Transfer data from URL`;

    return { success: true, output: helpText };
  }

  private cmdHistory(_args: string[], state: TerminalState): CommandResult {
    const output = state.history.map((cmd, i) => `  ${i + 1}  ${cmd}`).join('\n');
    return { success: true, output: output || '(no history)' };
  }

  private cmdEnv(_args: string[], state: TerminalState): CommandResult {
    const output = Object.entries(state.environment)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    return { success: true, output };
  }

  private cmdGrep(args: string[], state: TerminalState): CommandResult {
    if (args.length < 2) {
      return { success: false, output: '', error: 'grep: usage: grep PATTERN [FILE...]' };
    }

    const pattern = args[0];
    const files = args.slice(1);

    let results: string[] = [];
    for (const fileName of files) {
      const file = this.resolvePath(fileName, this.getRoot(state), state.currentDir);
      if (file && file.type === 'file' && file.content) {
        const lines = file.content.split('\n');
        for (const line of lines) {
          if (line.toLowerCase().includes(pattern.toLowerCase())) {
            results.push(line);
          }
        }
      }
    }

    return { success: true, output: results.join('\n') || '(no matches)' };
  }

  private cmdHead(args: string[], state: TerminalState): CommandResult {
    const linesCount = parseInt(args.find(a => a.startsWith('-'))?.slice(1) || '10', 10);
    const fileName = args.find(a => !a.startsWith('-'));

    if (!fileName) {
      return { success: false, output: '', error: 'head: missing file operand' };
    }

    const file = this.resolvePath(fileName, this.getRoot(state), state.currentDir);
    if (!file || file.type !== 'file' || !file.content) {
      return { success: false, output: '', error: `head: cannot open '${fileName}'` };
    }

    const lines = file.content.split('\n').slice(0, linesCount).join('\n');
    return { success: true, output: lines };
  }

  private cmdTail(args: string[], state: TerminalState): CommandResult {
    const linesCount = parseInt(args.find(a => a.startsWith('-'))?.slice(1) || '10', 10);
    const fileName = args.find(a => !a.startsWith('-'));

    if (!fileName) {
      return { success: false, output: '', error: 'tail: missing file operand' };
    }

    const file = this.resolvePath(fileName, this.getRoot(state), state.currentDir);
    if (!file || file.type !== 'file' || !file.content) {
      return { success: false, output: '', error: `tail: cannot open '${fileName}'` };
    }

    const lines = file.content.split('\n').slice(-linesCount).join('\n');
    return { success: true, output: lines };
  }

  private cmdWc(args: string[], state: TerminalState): CommandResult {
    const fileName = args.find(a => !a.startsWith('-'));

    if (!fileName) {
      return { success: false, output: '', error: 'wc: missing file operand' };
    }

    const file = this.resolvePath(fileName, this.getRoot(state), state.currentDir);
    if (!file || file.type !== 'file' || !file.content) {
      return { success: false, output: '', error: `wc: cannot open '${fileName}'` };
    }

    const content = file.content;
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).length;
    const chars = content.length;

    return { success: true, output: `  ${lines}  ${words}  ${chars}  ${fileName}` };
  }

  private cmdMan(args: string[], _state: TerminalState): CommandResult {
    const command = args[0];
    if (!command) {
      return { success: false, output: '', error: 'man: what manual page do you want?' };
    }

    const manuals: Record<string, string> = {
      ls: 'LS(1) - list directory contents\n\nUsage: ls [OPTION]... [FILE]...\n\nList information about FILEs.',
      cd: 'CD(1) - change directory\n\nUsage: cd [DIRECTORY]\n\nChange the shell working directory.',
      mkdir: 'MKDIR(1) - make directories\n\nUsage: mkdir [OPTION] DIRECTORY...\n\nCreate DIRECTORY.',
      cat: 'CAT(1) - concatenate files\n\nUsage: cat [OPTION] [FILE]...\n\nDisplay file contents.',
      pwd: 'PWD(1) - print working directory\n\nUsage: pwd\n\nPrint the full filename of the current working directory.'
    };

    if (manuals[command]) {
      return { success: true, output: manuals[command] };
    }

    return { success: false, output: '', error: `No manual entry for ${command}` };
  }

  private cmdChmod(_args: string[], _state: TerminalState): CommandResult {
    return { success: true, output: 'chmod: permissions changed (simulated)' };
  }

  private cmdPs(_args: string[], _state: TerminalState): CommandResult {
    return { 
      success: true, 
      output: `  PID TTY          TIME CMD
    1 ?        00:00:01 systemd
  1000 pts/0   00:00:00 bash
  1001 pts/0   00:00:00 ps` 
    };
  }

  private cmdPing(args: string[], _state: TerminalState): CommandResult {
    const host = args[0] || 'localhost';
    return {
      success: true,
      output: `PING ${host} (127.0.0.1) 56(84) bytes of data.
64 bytes from ${host} (127.0.0.1): icmp_seq=1 ttl=64 time=0.035 ms
64 bytes from ${host} (127.0.0.1): icmp_seq=2 ttl=64 time=0.042 ms
64 bytes from ${host} (127.0.0.1): icmp_seq=3 ttl=64 time=0.038 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2ms`
    };
  }

  private cmdCurl(args: string[], _state: TerminalState): CommandResult {
    const url = args.find(a => !a.startsWith('-')) || '';
    if (!url) {
      return { success: false, output: '', error: 'curl: no URL specified' };
    }
    return {
      success: true,
      output: `curl: simulated response from ${url}\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{"status": "ok"}`
    };
  }

  /**
   * Разрешение пути к узлу файловой системы
   */
  private resolvePath(path: string, root: FileSystemNode, currentDir?: string): FileSystemNode | null {
    let targetPath = path;

    if (path.startsWith('~')) {
      targetPath = currentDir?.replace(/\/[^/]*$/, '') + path.slice(1) || path;
    } else if (!path.startsWith('/') && currentDir) {
      targetPath = currentDir === '/' ? '/' + path : currentDir + '/' + path;
    }

    targetPath = this.normalizePath(targetPath);

    const parts = targetPath.split('/').filter(p => p);
    let current: FileSystemNode | null = root;

    for (const part of parts) {
      if (!current || current.type !== 'directory') return null;
      current = current.children?.find(c => c.name === part) || null;
    }

    return current;
  }

  /**
   * Нормализация пути
   */
  private normalizePath(path: string): string {
    const parts = path.split('/').filter(p => p && p !== '.');
    const normalized: string[] = [];

    for (const part of parts) {
      if (part === '..') {
        normalized.pop();
      } else {
        normalized.push(part);
      }
    }

    return '/' + normalized.join('/');
  }

  /**
   * Получение корневого узла
   */
  private getRoot(state: TerminalState): FileSystemNode {
    let current = state.fileSystem;
    while (current.parent) {
      current = current.parent;
    }
    return current;
  }

  /**
   * Проверка выполнения лабораторной работы
   */
  checkLabCompletion(lab: TerminalLab, state: TerminalState): boolean {
    const expected = lab.expectedState;
    const root = this.getRoot(state);

    // Проверка файлов
    if (expected.files) {
      for (const filePath of expected.files) {
        const file = this.resolvePath(filePath, root, state.currentDir);
        if (!file || file.type !== 'file') return false;
      }
    }

    // Проверка директорий
    if (expected.directories) {
      for (const dirPath of expected.directories) {
        const dir = this.resolvePath(dirPath, root, state.currentDir);
        if (!dir || dir.type !== 'directory') return false;
      }
    }

    // Проверка содержимого файлов
    if (expected.fileContents) {
      for (const [filePath, expectedContent] of Object.entries(expected.fileContents)) {
        const file = this.resolvePath(filePath, root, state.currentDir);
        if (!file || file.content !== expectedContent) return false;
      }
    }

    // Проверка текущей директории
    if (expected.currentDir && state.currentDir !== expected.currentDir) {
      return false;
    }

    // Проверка использованных команд
    if (expected.usedCommands) {
      const usedCommands = state.commandHistory.map(h => h.command.split(' ')[0]);
      for (const requiredCmd of expected.usedCommands) {
        if (!usedCommands.includes(requiredCmd)) return false;
      }
    }

    return true;
  }
}

// Singleton instance
export const terminalService = new TerminalService();
