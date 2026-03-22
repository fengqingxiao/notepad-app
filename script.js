// 记事本APP脚本
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const notesContainer = document.getElementById('notesContainer');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContentInput = document.getElementById('noteContent');
    const newNoteButton = document.getElementById('newNote');
    const saveNoteButton = document.getElementById('saveNote');
    const deleteNoteButton = document.getElementById('deleteNote');
    const searchBox = document.getElementById('searchBox');
    const statusMessage = document.getElementById('statusMessage');
    const totalNotesElement = document.getElementById('totalNotes');
    const categoryTagsContainer = document.getElementById('categoryTags');
    
    // 笔记数据
    let notes = JSON.parse(localStorage.getItem('notepadNotes') || '[]');
    let currentNoteId = null;
    
    // 笔记类别
    const categories = ['工作', '学习', '生活', '备忘', '灵感'];
    
    // 初始化类别标签
    initializeCategoryTags();
    
    // 更新统计信息
    updateStatistics();
    
    // 渲染笔记列表
    renderNotesList();
    
    // 新建笔记
    newNoteButton.addEventListener('click', function() {
        currentNoteId = null;
        noteTitleInput.value = '';
        noteContentInput.value = '';
        updateStatusMessage('新建笔记模式');
        
        // 移除删除按钮的禁用状态
        deleteNoteButton.classList.add('disabled');
        deleteNoteButton.disabled = true;
    });
    
    // 保存笔记
    saveNoteButton.addEventListener('click', function() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        
        if (!title || !content) {
            updateStatusMessage('标题和内容不能为空', 'error');
            return;
        }
        
        const note = {
            id: currentNoteId || Date.now().toString(),
            title: title,
            content: content,
            timestamp: new Date().toISOString(),
            category: getSelectedCategory()
        };
        
        if (currentNoteId) {
            // 更新现有笔记
            const index = notes.findIndex(n => n.id === currentNoteId);
            notes[index] = note;
        } else {
            // 添加新笔记
            notes.push(note);
        }
        
        localStorage.setItem('notepadNotes', JSON.stringify(notes));
        
        updateStatusMessage('笔记保存成功');
        renderNotesList();
        updateStatistics();
        
        // 如果有笔记选中，更新删除按钮状态
        if (currentNoteId) {
            deleteNoteButton.classList.remove('disabled');
            deleteNoteButton.disabled = false;
        }
    });
    
    // 删除笔记
    deleteNoteButton.addEventListener('click', function() {
        if (!currentNoteId) {
            updateStatusMessage('请先选择一个笔记', 'error');
            return;
        }
        
        notes = notes.filter(note => note.id !== currentNoteId);
        localStorage.setItem('notepadNotes', JSON.stringify(notes));
        
        currentNoteId = null;
        noteTitleInput.value = '';
        noteContentInput.value = '';
        
        updateStatusMessage('笔记已删除');
        renderNotesList();
        updateStatistics();
        
        deleteNoteButton.classList.add('disabled');
        deleteNoteButton.disabled = true;
    });
    
    // 搜索功能
    searchBox.addEventListener('input', function() {
        renderNotesList();
    });
    
    // 类别标签选择
    categoryTagsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('tag')) {
            const tags = categoryTagsContainer.querySelectorAll('.tag');
            tags.forEach(tag => tag.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
    
    // 渲染笔记列表
    function renderNotesList() {
        const searchText = searchBox.value.toLowerCase();
        notesContainer.innerHTML = '';
        
        const filteredNotes = notes.filter(note => {
            return note.title.toLowerCase().includes(searchText) ||
                   note.content.toLowerCase().includes(searchText);
        });
        
        filteredNotes.forEach(note => {
            const noteElement = createNoteElement(note);
            notesContainer.appendChild(noteElement);
        });
    }
    
    // 创建笔记元素
    function createNoteElement(note) {
        const element = document.createElement('div');
        element.classList.add('note-item');
        element.dataset.id = note.id;
        
        const title = document.createElement('h3');
        title.textContent = note.title;
        
        const preview = document.createElement('p');
        preview.textContent = note.content.length > 50 ? 
            note.content.substring(0, 50) + '...' : note.content;
        
        const date = document.createElement('div');
        date.classList.add('note-date');
        date.textContent = new Date(note.timestamp).toLocaleString();
        
        const category = document.createElement('div');
        category.classList.add('note-category');
        category.textContent = note.category || '未分类';
        category.style.fontSize = '12px';
        category.style.color = '#4a6fa5';
        category.style.marginTop = '5px';
        
        element.appendChild(title);
        element.appendChild(preview);
        element.appendChild(date);
        element.appendChild(category);
        
        element.addEventListener('click', function() {
            const allNotes = document.querySelectorAll('.note-item');
            allNotes.forEach(n => n.classList.remove('active'));
            element.classList.add('active');
            
            currentNoteId = note.id;
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
            
            deleteNoteButton.classList.remove('disabled');
            deleteNoteButton.disabled = false;
            
            // 更新类别选择
            const tags = categoryTagsContainer.querySelectorAll('.tag');
            tags.forEach(tag => {
                tag.classList.remove('active');
                if (tag.textContent === note.category) {
                    tag.classList.add('active');
                }
            });
            
            updateStatusMessage('正在编辑笔记');
        });
        
        return element;
    }
    
    // 更新状态消息
    function updateStatusMessage(message, type = 'success') {
        statusMessage.textContent = message;
        statusMessage.style.backgroundColor = type === 'error' ? '#f8d7da' : '#d4edda';
        statusMessage.style.color = type === 'error' ? '#721c24' : '#155724';
        
        setTimeout(() => {
            statusMessage.textContent = '';
        }, 3000);
    }
    
    // 更新统计信息
    function updateStatistics() {
        totalNotesElement.textContent = notes.length;
        
        // 更新类别统计
        const categoryStats = {};
        notes.forEach(note => {
            const cat = note.category || '未分类';
            categoryStats[cat] = (categoryStats[cat] || 0) + 1;
        });
        
        const statsContainer = document.getElementById('categoryStats');
        statsContainer.innerHTML = '';
        
        Object.keys(categoryStats).forEach(cat => {
            const statElement = document.createElement('div');
            statElement.classList.add('stat-item');
            statElement.innerHTML = `
                <span>${cat}</span>
                <span class="stat-value">${categoryStats[cat]}</span>
            `;
            statsContainer.appendChild(statElement);
        });
    }
    
    // 初始化类别标签
    function initializeCategoryTags() {
        categories.forEach(category => {
            const tag = document.createElement('span');
            tag.classList.add('tag');
            tag.textContent = category;
            tag.dataset.category = category;
            categoryTagsContainer.appendChild(tag);
        });
        
        // 默认选择第一个
        categoryTagsContainer.querySelector('.tag').classList.add('active');
    }
    
    // 获取选中的类别
    function getSelectedCategory() {
        const activeTag = categoryTagsContainer.querySelector('.tag.active');
        return activeTag ? activeTag.textContent : categories[0];
    }
    
    // 导出功能示例（未来扩展）
    function exportNotes() {
        const data = {
            notes: notes,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes-backup.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    // 创建导出按钮（可选）
    const exportButton = document.getElementById('exportNotes');
    if (exportButton) {
        exportButton.addEventListener('click', exportNotes);
    }
});

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        document.getElementById('saveNote').click();
    }
    
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('newNote').click();
    }
});