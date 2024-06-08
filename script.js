document.addEventListener('DOMContentLoaded', () => {
    const nameInquiryModal = document.getElementById('nameInquiryModal');
    const userNameInput = document.getElementById('userNameInput');
    const newUserNameInput = document.getElementById('newUserName');
    const userNameDisplay = document.getElementById('username');
    const taskCategorySelect = document.getElementById('taskCategory');
    const deletedTaskList = document.getElementById('deletedTaskList');
    const consistencyFill = document.getElementById('consistencyFill');
    const consistencyBar = document.getElementById('consistencyBar');
    const undoMessage = document.getElementById('undoMessage');

    let lastDeletedTask = null;

    if (!localStorage.getItem('userName')) {
        nameInquiryModal.style.display = 'block';
    } else {
        const userName = localStorage.getItem('userName');
        userNameDisplay.textContent = userName;
        updateGreeting();
        updateTime();
        setInterval(updateTime, 1000); 
    }

    document.querySelector('#nameInquiryModal button').addEventListener('click', saveUserName);
    document.querySelector('#changeNameModal button').addEventListener('click', changeUserName);
    
    document.getElementById('profilePic').addEventListener('click', () => {
        document.getElementById('uploadProfilePic').click();
    });

    document.getElementById('uploadProfilePic').addEventListener('change', function() {
        const file = this.files[0];
        const reader = new FileReader();
        reader.onloadend = function() {
            document.getElementById('profilePic').src = reader.result;
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    });

    function saveUserName() {
        const userName = userNameInput.value.trim();
        if (userName) {
            localStorage.setItem('userName', userName);
            userNameDisplay.textContent = userName;
            nameInquiryModal.style.display = 'none';
            updateGreeting();
            updateTime();
            setInterval(updateTime, 1000); 
        } else {
            showAlert('Please enter a valid name.');
        }
    }

    function changeUserName() {
        const userName = newUserNameInput.value.trim();
        if (userName) {
            localStorage.setItem('userName', userName);
            userNameDisplay.textContent = userName;
            document.getElementById('changeNameModal').style.display = 'none';
            updateGreeting();
        } else {
            showAlert('Please enter a valid name.');
        }
    }

    function updateGreeting() {
        const now = new Date();
        const hours = now.getHours();
        const day = now.toLocaleDateString('en-US', { weekday: 'long' });
        let greeting = '';

        const userName = localStorage.getItem('userName');

        if (hours < 12) {
            greeting = `Good morning, ${userName}! Have a productive day!`;
        } else if (hours < 16) {
            greeting = `Good afternoon, ${userName}! Keep up the good work!`;
        } else {
            greeting = `Good evening, ${userName}! Time to unwind and relax!`;
        }

        document.getElementById('greeting').textContent = `${greeting} It's ${day}.`;
    }

    function updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const time = `${hours}:${minutes}:${seconds}`;
        const greetingElement = document.getElementById('greeting');
        const currentGreeting = greetingElement.textContent.split(' It\'s')[0]; 
        greetingElement.textContent = `${currentGreeting} It's ${time}.`; 
    }

    function updateConsistency() {
        const taskListItems = document.querySelectorAll('#taskList li');
        const completedTaskListItems = document.querySelectorAll('#completedTaskList li');
    
        const totalTasks = taskListItems.length + completedTaskListItems.length; 
        const completedTasks = completedTaskListItems.length;
        const consistencyPercentage = totalTasks === 0 ? 100 : (completedTasks / totalTasks) * 100;
    
        consistencyFill.style.width = `${consistencyPercentage}%`;
            
        if (consistencyPercentage === 0 || consistencyPercentage === 100) {
            consistencyFill.classList.remove('animate-consistency');
            void consistencyFill.offsetWidth; 
        } else {
            consistencyFill.classList.add('animate-consistency');
        }
    }

    function addTask() {
        const category = taskCategorySelect.value;
        const taskName = document.getElementById('taskName').value.trim();
        if (taskName) {
            const taskList = document.getElementById('taskList');
            const li = document.createElement('li');
            const createdAt = new Date(); 
            li.textContent = taskName;
            li.dataset.createdAt = createdAt.toLocaleDateString('en-US'); 
            li.classList.add(category);
            const taskActions = document.createElement('div');
            taskActions.classList.add('task-actions');
            const doneBtn = document.createElement('div');
            doneBtn.classList.add('done-btn');
            doneBtn.innerHTML = '<i class="fas fa-check"></i>';
            doneBtn.onclick = () => {
                li.classList.add('completed');
                document.getElementById('completedTaskList').appendChild(li);
                lastDeletedTask = { element: li, category: category };
                updateConsistency();
                updateCategoryTaskCount(category); 
                updateAnalytics(); 
                showUndoMessage();
            };
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => {
                li.classList.add('deleted-task');
                deletedTaskList.appendChild(li);
                lastDeletedTask = { element: li, category: category };
                updateConsistency();
                updateCategoryTaskCount(category); 
                updateAnalytics(); 
                showUndoMessage();
            };
            taskActions.appendChild(doneBtn);
            taskActions.appendChild(deleteBtn);
            li.appendChild(taskActions);
            taskList.appendChild(li);
    
            document.getElementById('taskName').value = '';
            closeAddTaskModal();
            updateConsistency();
            updateCategoryTaskCount(category); 
            updateAnalytics(); 
        } else {
            showAlert('Please enter a valid task.');
        }
    }

    function showUndoMessage() {
        undoMessage.style.display = 'block';
        setTimeout(() => {
            undoMessage.style.display = 'none';
        }, 5000);
    }

    window.undoLastAction = function() {
        if (lastDeletedTask) {
            const taskElement = lastDeletedTask.element;
            const category = lastDeletedTask.category;
            taskElement.classList.remove('completed', 'deleted-task');
            document.getElementById('taskList').appendChild(taskElement);
            updateConsistency();
            updateCategoryTaskCount(category);
            updateAnalytics();
            lastDeletedTask = null;
            undoMessage.style.display = 'none';
        }
    };

    function updateCategoryTaskCount(category) {
        const categoryTaskCountElement = document.getElementById(`${category}TaskCount`);
        const categoryTasksCount = document.querySelectorAll(`#taskList .${category}`).length;
        categoryTaskCountElement.textContent = `${categoryTasksCount} tasks`;
    }

    function addCategory() {
        const categoryName = document.getElementById('newCategoryName').value.trim();
        if (categoryName) {
            const formattedCategoryName = categoryName.toLowerCase().replace(/\s+/g, '-');
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category', formattedCategoryName);
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = categoryName;
            const taskCount = document.createElement('p');
            taskCount.id = `${formattedCategoryName}TaskCount`;
            taskCount.textContent = '0 tasks';
            const deleteCategoryBtn = document.createElement('button');
            deleteCategoryBtn.classList.add('delete-category');
            deleteCategoryBtn.textContent = 'Delete';
            deleteCategoryBtn.onclick = () => {
                categoryDiv.remove();
                const options = document.querySelectorAll(`#taskCategory option[value="${formattedCategoryName}"]`);
                options.forEach(option => option.remove());
            };
            categoryDiv.appendChild(categoryTitle);
            categoryDiv.appendChild(taskCount);
            categoryDiv.appendChild(deleteCategoryBtn);
            document.getElementById('categories').appendChild(categoryDiv);

            const option = document.createElement('option');
            option.value = formattedCategoryName;
            option.textContent = categoryName;
            taskCategorySelect.appendChild(option);

            document.getElementById('newCategoryName').value = '';
            closeAddCategoryModal();
        } else {
            showAlert('Please enter a valid category name.');
        }
    }

    function showDeletedTasks() {
        document.getElementById('deletedTasksModal').style.display = 'block';
    }

    function showAnalytics() {
        const taskListItems = document.querySelectorAll('#taskList li');
        const completedTaskListItems = document.querySelectorAll('#completedTaskList li');
    
        const totalTasks = taskListItems.length + completedTaskListItems.length;
        const completedTasks = completedTaskListItems.length;
        const completionRate = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('completionRate').textContent = `${completionRate.toFixed(2)}%`;
    
        document.getElementById('analyticsModal').style.display = 'block';
    }

    window.addTask = addTask;
    window.addCategory = addCategory;
    window.showAnalytics = showAnalytics;
    window.closeAnalyticsModal = () => document.getElementById('analyticsModal').style.display = 'none';
    window.showDeletedTasks = showDeletedTasks;
    window.closeDeletedTasksModal = () => document.getElementById('deletedTasksModal').style.display = 'none';
    window.openAddTaskModal = () => document.getElementById('addTaskModal').style.display = 'block';
    window.closeAddTaskModal = () => document.getElementById('addTaskModal').style.display = 'none';
    window.openAddCategoryModal = () => document.getElementById('addCategoryModal').style.display = 'block';
    window.closeAddCategoryModal = () => document.getElementById('addCategoryModal').style.display = 'none';
    window.openChangeNameModal = () => document.getElementById('changeNameModal').style.display = 'block';
    window.closeChangeNameModal = () => document.getElementById('changeNameModal').style.display = 'none';

    function showAlert(msg) {
        alert(msg);
    }

    window.showAlert = showAlert;

    const sidebarToggle = document.querySelector('.toggle-sidebar');
    const sidebar = document.getElementById('sidebar');

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.sidebar') && sidebar.classList.contains('show') && !event.target.closest('.toggle-sidebar')) {
            sidebar.classList.remove('show');
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
        }
    });

    if (window.innerWidth <= 768) {
        sidebar.classList.remove('show');
    } else {
        sidebar.classList.add('show');
    }
});
