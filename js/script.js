 // Initialize tasks array from localStorage or empty array
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let taskToDelete = null;

        // DOM elements
        const taskForm = document.getElementById('taskForm');
        const taskTitle = document.getElementById('taskTitle');
        const titleError = document.getElementById('titleError');
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filterStatus = document.getElementById('filterStatus');
        const filterCategory = document.getElementById('filterCategory');
        const confirmModal = document.getElementById('confirmModal');
        const cancelDelete = document.getElementById('cancelDelete');
        const confirmDelete = document.getElementById('confirmDelete');
        const currentDateTimeElement = document.getElementById('currentDateTime');

        // Update current date and time
        function updateDateTime() {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            currentDateTimeElement.textContent = now.toLocaleDateString('en-US', options);
        }

        // Update time every second
        updateDateTime();
        setInterval(updateDateTime, 1000);

        // Save tasks to localStorage
        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        // Render tasks based on filters
        function renderTasks() {
            const statusFilter = filterStatus.value;
            const categoryFilter = filterCategory.value;
            
            const filteredTasks = tasks.filter(task => {
                const statusMatch = statusFilter === 'all' || 
                                  (statusFilter === 'pending' && !task.completed) || 
                                  (statusFilter === 'completed' && task.completed);
                
                const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter;
                
                return statusMatch && categoryMatch;
            });

            if (filteredTasks.length === 0) {
                emptyState.classList.remove('hidden');
                taskList.innerHTML = '';
                taskList.appendChild(emptyState);
            } else {
                emptyState.classList.add('hidden');
                taskList.innerHTML = '';
                
                filteredTasks.forEach((task, index) => {
                    const taskElement = document.createElement('div');
                    taskElement.className = `task-card bg-gray-800 rounded-xl p-6 shadow-lg ${task.completed ? 'completed' : 'pending'}`;
                    
                    const priorityColors = {
                        high: 'text-red-400',
                        medium: 'text-yellow-400',
                        low: 'text-green-400'
                    };
                    
                    const priorityText = {
                        high: 'High',
                        medium: 'Medium',
                        low: 'Low'
                    };
                    
                    const categoryColors = {
                        work: 'bg-blue-500',
                        personal: 'bg-purple-500',
                        shopping: 'bg-green-500',
                        other: 'bg-gray-500'
                    };
                    
                    taskElement.innerHTML = `
                        <div class="flex flex-col space-y-4">
                            <div class="flex justify-between items-start">
                                <div class="flex items-start space-x-3">
                                    <button onclick="toggleTaskCompletion(${index})" class="mt-1 flex-shrink-0">
                                        <div class="w-6 h-6 rounded-full border-2 ${task.completed ? 'border-green-400 bg-green-400' : 'border-blue-400'} flex items-center justify-center">
                                            ${task.completed ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                                        </div>
                                    </button>
                                    <div>
                                        <h3 class="font-medium text-lg ${task.completed ? 'line-through text-gray-400' : 'text-white'}">${task.title}</h3>
                                        ${task.description ? `<p class="text-gray-400 mt-1">${task.description}</p>` : ''}
                                        <div class="flex flex-wrap gap-2 mt-2">
                                            <span class="text-xs px-2 py-1 rounded-full ${categoryColors[task.category]}">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                                            <span class="text-xs px-2 py-1 rounded-full bg-gray-700 ${priorityColors[task.priority]}">
                                                <i class="fas fa-bolt mr-1"></i>${priorityText[task.priority]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button onclick="showDeleteModal(${index})" class="text-gray-400 hover:text-red-400 transition">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                            
                            <div class="flex flex-wrap justify-between items-center pt-2 border-t border-gray-700 text-sm text-gray-400">
                                <div>
                                    <i class="far fa-clock mr-1"></i>
                                    <span>Created: ${task.createdAt}</span>
                                </div>
                                <div>
                                    ${task.completed ? `
                                        <i class="fas fa-check-circle mr-1 text-green-400"></i>
                                        <span>Completed: ${task.completedAt}</span>
                                    ` : `
                                        <i class="fas fa-spinner mr-1 text-yellow-400 animate-spin"></i>
                                        <span>In progress</span>
                                    `}
                                </div>
                            </div>
                        </div>
                    `;
                    
                    taskList.appendChild(taskElement);
                });
            }
        }

        // Toggle task completion status
        function toggleTaskCompletion(index) {
            tasks[index].completed = !tasks[index].completed;
            
            if (tasks[index].completed) {
                const now = new Date();
                tasks[index].completedAt = now.toLocaleString();
            } else {
                tasks[index].completedAt = null;
            }
            
            saveTasks();
            renderTasks();
        }

        // Show delete confirmation modal
        function showDeleteModal(index) {
            taskToDelete = index;
            confirmModal.classList.remove('hidden');
        }

        // Hide delete confirmation modal
        function hideDeleteModal() {
            confirmModal.classList.add('hidden');
            taskToDelete = null;
        }

        // Add new task
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (taskTitle.value.trim() === '') {
                titleError.classList.remove('hidden');
                taskTitle.classList.add('border-red-500');
                return;
            }
            
            titleError.classList.add('hidden');
            taskTitle.classList.remove('border-red-500');
            
            const now = new Date();
            const newTask = {
                title: taskTitle.value.trim(),
                description: document.getElementById('taskDescription').value.trim(),
                priority: document.getElementById('taskPriority').value,
                category: document.getElementById('taskCategory').value,
                completed: false,
                createdAt: now.toLocaleString(),
                completedAt: null
            };
            
            tasks.unshift(newTask);
            saveTasks();
            renderTasks();
            
            // Reset form
            taskForm.reset();
            document.getElementById('taskPriority').value = 'medium';
            document.getElementById('taskCategory').value = 'personal';
            
            // Scroll to top of task list
            taskList.scrollIntoView({ behavior: 'smooth' });
        });

        // Delete task confirmation
        confirmDelete.addEventListener('click', function() {
            if (taskToDelete !== null) {
                tasks.splice(taskToDelete, 1);
                saveTasks();
                renderTasks();
                hideDeleteModal();
            }
        });

        // Cancel delete
        cancelDelete.addEventListener('click', hideDeleteModal);

        // Filter tasks when filter changes
        filterStatus.addEventListener('change', renderTasks);
        filterCategory.addEventListener('change', renderTasks);

        // Initial render
        renderTasks();
