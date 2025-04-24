// ==UserScript==
// @name         Better GMGN.ai
// @namespace    https://github.com/0xseven7/inhancement
// @homepageURL  https://github.com/0xseven7/inhancement/blob/main/src/gmgn_ai.user.ts
// @version      0.0.19
// @description  调整屏宽
// @author       0xseven7
// @icon         https://gmgn.ai/static/favicon2.ico
// @license      MIT
// @updateURL    https://mirror.ghproxy.com/https://github.com/0xseven7/inhancement/releases/download/latest/gmgn_ai.meta.js
// @downloadURL  https://mirror.ghproxy.com/https://github.com/0xseven7/inhancement/releases/download/latest/gmgn_ai.user.js
// @match        https://gmgn.ai/*
// @grant        GM_openInTab
// @noframes
// ==/UserScript==

import { HTMLUtils, Logger } from './util'

const logger = Logger.new('Better DEX Screener')
function main() {
  console.log('Better1 GMGN.ai')
  HTMLUtils.observe(
    document.body,
    async () => {
      if (!document.getElementById('floatingDiv')) {
        createFloatingWindow()
      } 
     },
    { waiting: true, throttle: 500 }
  )
}
function createFloatingWindow() {
  const floatingDiv = document.createElement('div')
  floatingDiv.id = 'floatingDiv'
  floatingDiv.style.setProperty('position', 'fixed')
  floatingDiv.style.setProperty('top', '20px')
  floatingDiv.style.setProperty('left', '40%')
  floatingDiv.style.setProperty('background-color', '#000000')
  floatingDiv.style.setProperty('padding', '10px')
  floatingDiv.style.setProperty('border-radius', '5px')
  floatingDiv.style.setProperty('z-index', '9999')
  floatingDiv.style.setProperty('color', 'white')
  floatingDiv.style.setProperty('font-size', '14px')
  floatingDiv.style.setProperty('width', 'fit-content')
  floatingDiv.style.setProperty('transition', 'all 0.3s ease') // 添加过渡效果
  floatingDiv.style.setProperty('cursor', 'move') // 添加移动光标
  
  // 添加鼠标悬浮效果
  floatingDiv.addEventListener('mouseenter', () => {
    floatingDiv.style.setProperty('transform', 'scale(1.05)')
    floatingDiv.style.setProperty('box-shadow', '0 0 10px rgba(0, 255, 0, 0.3)')
    floatingDiv.style.setProperty('background-color', '#111111')
  })
  
  floatingDiv.addEventListener('mouseleave', () => {
    floatingDiv.style.setProperty('transform', 'scale(1)')
    floatingDiv.style.setProperty('box-shadow', 'none')
    floatingDiv.style.setProperty('background-color', 'rgba(0, 255, 0, 0.3)')
  })

  // 创建容器
  const content = document.createElement('div')
  content.style.setProperty('display', 'flex')
  content.style.setProperty('flex-direction', 'column')
  content.style.setProperty('gap', '10px')
  
  // Axiom 链接
  const axiomLink = document.createElement('a')
  axiomLink.target = '_blank'
  axiomLink.style.setProperty('color', '#00ff00')
  axiomLink.textContent = 'Axiom'
  content.appendChild(axiomLink)
  
  // 添加保存按钮
  const saveButton = document.createElement('button')
  saveButton.textContent = '导出'
  saveButton.style.setProperty('border', 'none')
  saveButton.style.setProperty('padding', '5px 10px')
  saveButton.style.setProperty('border-radius', '3px')
  saveButton.style.setProperty('color', '#00ff00')
  
  saveButton.addEventListener('click', () => {
    let walletMark = localStorage.getItem('wallet_mark')
    if (!walletMark) {
      // 如果 wallet_mark 不存在，尝试从 wallet_mark_multichain 中获取 sol 数据
      const multichain = localStorage.getItem('wallet_mark_multichain')
      if (multichain) {
        try {
          const multichainData = JSON.parse(multichain)
          if (multichainData.sol) {
            walletMark = JSON.stringify(multichainData.sol)
          }
        } catch (e) {
          console.error('解析 wallet_mark_multichain 失败:', e)
        }
      }
    }

    const parserdData = parserData(walletMark)
    if (walletMark) {
      // 创建一个 Blob 对象
      const blob = new Blob([parserdData], { type: 'text/plain' })
      // 创建下载链接
      const downloadLink = document.createElement('a')
      downloadLink.href = URL.createObjectURL(blob)
      downloadLink.download = 'wallet_mark.txt'
      // 触发下载
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      // 释放 URL 对象
      URL.revokeObjectURL(downloadLink.href)
    } else {
      alert('未找到钱包标记数据')
    }
  })
  
  content.appendChild(saveButton)
  
  // 更新显示内容的函数
  const updateContent = () => {
    // 更新 Axiom 链接
    const parts = document.location.pathname.split('/')
    const tokenAddress = parts[parts.length - 1]
    axiomLink.href = `https://axiom.trade/t/${tokenAddress}`
    
  }
  
  // 初始更新
  updateContent()
  
  // 监听 URL 和 localStorage 变化
  const observer = new MutationObserver(() => {
    if (document.location.pathname !== axiomLink.dataset.lastPath) {
      axiomLink.dataset.lastPath = document.location.pathname
      updateContent()
    }
  })
  
  window.addEventListener('storage', updateContent)
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
  
  floatingDiv.appendChild(content)
  document.body.appendChild(floatingDiv)
  
  // 添加拖拽功能
  let isDragging = false
  let initialX: number
  let initialY: number
  let offsetX: number
  let offsetY: number

  floatingDiv.addEventListener('mousedown', (e) => {
    isDragging = true
    const rect = floatingDiv.getBoundingClientRect()
    offsetX = e.clientX - rect.left
    offsetY = e.clientY - rect.top
    initialX = e.clientX
    initialY = e.clientY
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    e.preventDefault()
    
    const newX = e.clientX - offsetX
    const newY = e.clientY - offsetY
    
    floatingDiv.style.left = `${newX}px`
    floatingDiv.style.top = `${newY}px`
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
  })
}
function parserData(walletMark: string| null) {
  if (!walletMark) return ''
  
  // 移除 {} 和 ""
  const cleanData = walletMark.replace(/[{}"]/g, '')
  
  // 按逗号分割成数组，每个元素就是一行数据
  const lines = cleanData.split(',')
  
  // 过滤掉空行，并用换行符连接
  return lines
    .filter(line => line.trim())
    .join('\n')
}


main()