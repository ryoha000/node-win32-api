import * as D from '../windef';
import * as GT from '../types';


export const fnDef: GT.Win32FnDef = {
    GetLastError: [D.DWORD, []], // err code: https://msdn.microsoft.com/zh-cn/library/windows/desktop/ms681381(v=vs.85).aspx

    GetModuleHandleW: [D.HMODULE, [D.LPCTSTR]],    // retrive value from buf by ret.ref().readUInt32()

    GetModuleHandleExW: [D.BOOL, [D.DWORD, D.LPCTSTR, D.HMODULE]],     // flags, optional LPCTSTR name, ref hModule

    GetProcessHeaps: [D.DWORD, [D.DWORD, D.PHANDLE]],

    HeapFree: [D.BOOL, [D.HANDLE, D.DWORD, D.LPVOID]],
};

export interface Win32Fn {
    GetLastError(): GT.DWORD;

    GetModuleHandleW(lpModuleName: GT.LPCTSTR): GT.HMODULE;

    GetModuleHandleExW(dwFlags: GT.DWORD, lpModuleName: GT.LPCTSTR | null, phModule: GT.HMODULE): GT.BOOL;

    GetProcessHeaps(NumberOfHeaps: GT.DWORD, ProcessHeaps: GT.PHANDLE): GT.DWORD;

    HeapFree( hHeap: GT.HANDLE, dwFlags: GT.DWORD, lpMem: GT.LPVOID | null): GT.BOOL;
}