/* =========================================================
   首页导航区 + 分类页子分类胶囊 + 侧栏分类树当前项高亮
   - 首页第 1 页：在文章列表前插入“文章导航”与“最新文章”标题行
   - 分类页：在文章列表前插入子分类胶囊
   - 全站：给侧栏分类树当前分类加 current 高亮
   - 类名统一使用 nav- 前缀，避免与主题冲突
   ========================================================= */
(function () {
  'use strict'

  // 四个一级分类的导航数据（URL 与构建产物一致，子分类仅收录已有文章的分类）
  var NAV_DATA = [
    {
      name: '算法',
      desc: '每日一题与底层理论',
      icon: 'fas fa-code',
      bar: '#2F6FD0',
      chipBg: '#E6F0FD',
      chipText: '#1F4FA8',
      url: '/categories/%E7%AE%97%E6%B3%95/',
      chips: [
        { name: 'LeetCode 题解', url: '/categories/%E7%AE%97%E6%B3%95/LeetCode-%E9%A2%98%E8%A7%A3/' },
        { name: '数据结构与算法', url: '/categories/%E7%AE%97%E6%B3%95/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E4%B8%8E%E7%AE%97%E6%B3%95/' }
      ]
    },
    {
      name: '项目实战',
      desc: '跟做项目的开发记录',
      icon: 'fas fa-cubes',
      bar: '#0E8FB3',
      chipBg: '#E3F4F8',
      chipText: '#0E6F8C',
      url: '/categories/%E9%A1%B9%E7%9B%AE%E5%AE%9E%E6%88%98/',
      chips: [
        { name: '外卖管理系统', url: '/categories/%E9%A1%B9%E7%9B%AE%E5%AE%9E%E6%88%98/%E5%A4%96%E5%8D%96%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F/' }
      ]
    },
    {
      name: '后端筑基',
      desc: 'Java、数据库、框架基础',
      icon: 'fas fa-layer-group',
      bar: '#5B6FD8',
      chipBg: '#ECEEFB',
      chipText: '#3A49A6',
      url: '/categories/%E5%90%8E%E7%AB%AF%E7%AD%91%E5%9F%BA/',
      chips: [
        { name: 'Java基础', url: '/categories/%E5%90%8E%E7%AB%AF%E7%AD%91%E5%9F%BA/Java%E5%9F%BA%E7%A1%80/' },
        { name: '数据库与中间件', url: '/categories/%E5%90%8E%E7%AB%AF%E7%AD%91%E5%9F%BA/%E6%95%B0%E6%8D%AE%E5%BA%93%E4%B8%8E%E4%B8%AD%E9%97%B4%E4%BB%B6/' },
        { name: '框架与Web开发', url: '/categories/%E5%90%8E%E7%AB%AF%E7%AD%91%E5%9F%BA/%E6%A1%86%E6%9E%B6%E4%B8%8EWeb%E5%BC%80%E5%8F%91/' }
      ]
    },
    {
      name: '博客建设',
      desc: 'Hexo 与 Butterfly 踩坑记录',
      icon: 'fas fa-tools',
      bar: '#6B8BB8',
      chipBg: '#EDF2F8',
      chipText: '#4A6489',
      url: '/categories/%E5%8D%9A%E5%AE%A2%E5%BB%BA%E8%AE%BE/',
      chips: []
    }
  ]

  function decodedPathname () {
    try {
      return decodeURIComponent(window.location.pathname)
    } catch (e) {
      return window.location.pathname
    }
  }

  function isHomeFirstPage () {
    var p = window.location.pathname
    return p === '/' || p === '/index.html'
  }

  function buildNavSection () {
    var section = document.createElement('section')
    section.id = 'nav'

    var title = document.createElement('h2')
    title.className = 'nav-section-title'
    title.textContent = '文章导航'
    section.appendChild(title)

    var grid = document.createElement('div')
    grid.className = 'nav-grid'

    NAV_DATA.forEach(function (cat) {
      var card = document.createElement('div')
      card.className = 'nav-card'
      card.style.setProperty('--nav-bar', cat.bar)
      card.style.setProperty('--nav-chip-bg', cat.chipBg)
      card.style.setProperty('--nav-chip-text', cat.chipText)

      var main = document.createElement('a')
      main.className = 'nav-card-main'
      main.href = cat.url
      main.setAttribute('aria-label', cat.name)
      card.appendChild(main)

      var head = document.createElement('div')
      head.className = 'nav-card-title'
      var icon = document.createElement('i')
      icon.className = cat.icon
      var nameSpan = document.createElement('span')
      nameSpan.textContent = cat.name
      head.appendChild(icon)
      head.appendChild(nameSpan)
      card.appendChild(head)

      var desc = document.createElement('div')
      desc.className = 'nav-card-desc'
      desc.textContent = cat.desc
      card.appendChild(desc)

      if (cat.chips.length) {
        var chips = document.createElement('div')
        chips.className = 'nav-card-chips'
        cat.chips.forEach(function (chip) {
          var a = document.createElement('a')
          a.className = 'nav-chip'
          a.href = chip.url
          a.textContent = chip.name
          chips.appendChild(a)
        })
        card.appendChild(chips)
      }

      grid.appendChild(card)
    })

    section.appendChild(grid)
    return section
  }

  function buildPostsHead () {
    var head = document.createElement('div')
    head.className = 'nav-posts-head'

    var title = document.createElement('h2')
    title.className = 'nav-posts-title'
    title.textContent = '最新文章'
    head.appendChild(title)

    var more = document.createElement('a')
    more.className = 'nav-posts-more'
    more.href = '/archives/'
    more.textContent = '全部文章 →'
    head.appendChild(more)

    return head
  }

  function buildCategoryChips () {
    var current = decodedPathname()
    var match = null
    NAV_DATA.forEach(function (cat) {
      var decodedUrl = decodeURIComponent(cat.url)
      if (!match && current.indexOf(decodedUrl) === 0 && cat.chips.length) {
        match = cat
      }
    })
    if (!match) return null

    var bar = document.createElement('div')
    bar.className = 'nav-cat-chips'

    match.chips.forEach(function (chip) {
      var a = document.createElement('a')
      a.className = 'nav-chip'
      a.href = chip.url
      a.textContent = chip.name
      if (decodeURIComponent(chip.url) === current) {
        a.classList.add('active')
      }
      bar.appendChild(a)
    })

    return bar
  }

  function markCurrentCategory () {
    var current = decodedPathname()
    var links = document.querySelectorAll('#aside-content .card-category-list-link')
    links.forEach(function (link) {
      var href = link.getAttribute('href') || ''
      try {
        var linkPath = decodeURIComponent(href.replace(/[?#].*$/, ''))
        link.classList.toggle('current', linkPath === current)
      } catch (e) {
        link.classList.remove('current')
      }
    })
  }

  function prependToRecentPosts (node) {
    var recent = document.querySelector('#recent-posts')
    if (!recent || !recent.parentNode) return false
    recent.insertBefore(node, recent.firstChild)
    return true
  }

  function expandCurrentCategory () {
    var current = document.querySelector('#aside-content .card-category-list-link.current')
    if (!current) return

    var childList = current.parentElement.querySelector(':scope > .card-category-list.child')
    var parentLink = current
    if (childList) {
      var parentItem = childList.parentElement
      parentLink = parentItem.querySelector(':scope > .card-category-list-link')
    }
    if (parentLink) {
      parentLink.classList.add('expand')
    }
  }

  function init () {
    markCurrentCategory()
    expandCurrentCategory()

    var recent = document.querySelector('#recent-posts')
    if (!recent) return

    if (isHomeFirstPage()) {
      var oldNav = document.querySelector('#recent-posts > #nav')
      var oldHead = document.querySelector('#recent-posts > .nav-posts-head')
      if (oldNav) oldNav.parentNode.removeChild(oldNav)
      if (oldHead) oldHead.parentNode.removeChild(oldHead)

      var section = buildNavSection()
      var head = buildPostsHead()
      if (prependToRecentPosts(head) && prependToRecentPosts(section)) {
        if (window.location.hash === '#nav') {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    } else if (/^\/categories\//.test(window.location.pathname)) {
      var oldChips = document.querySelector('#recent-posts > .nav-cat-chips')
      if (oldChips) oldChips.parentNode.removeChild(oldChips)

      var chips = buildCategoryChips()
      if (chips) {
        prependToRecentPosts(chips)
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init)
  document.addEventListener('pjax:complete', init)
})()
