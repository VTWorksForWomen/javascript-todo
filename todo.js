var TASKID = 1;

function Task(name) {
    this.name = name;
    this.id = TASKID++;
    this.createdAt = new Date();
}

Task.prototype = {
    name: '',
    isComplete: false,
    createdAt: null
};

function TaskList(name) {
    this.name = name;
    this.tasks = [];
}

TaskList.prototype = {
    add: function(task) {
        this.tasks.push(task);
    },
    remove: function(taskId) {
        this.tasks = this.tasks.filter(function(task) {
            return taskId !== task.id;
        });
    },
    find: function(taskId) {
        for (var i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].id === taskId) {
                return this.tasks[i];
            }
        }
    }
};

function TaskListStore(key) {
    this.key = key;
}

TaskListStore.prototype = {
    save: function(taskList) {
        var data = {
            name: taskList.name,
            tasks: taskList.tasks
        };
        window.localStorage.setItem(this.key, JSON.stringify(data));
    },
    load: function() {
        var data = window.localStorage.getItem(this.key);
        if (!data) {
            return false;
        }

        var data = JSON.parse(data);
        var taskList = new TaskList(data.name);
        for (var i = 0; i < data.tasks.length; i++) {
            var task = new Task(data.tasks[i].name);
            task.isComplete = data.tasks[i].isComplete;
            taskList.add(task);
        }

        return taskList;
    }
};

var TodoApp = function(element, taskList, store) {
    this.element = element;
    this.taskList = taskList;
    this.store = store;
};

TodoApp.prototype = {
    render: function() {
        this.renderTasks();
        this.setupEvents();
    },
    renderTasks: function() {
        if (!this.taskContainer) {
            this.element.innerHTML += '<div id="task-list"></div>';
            this.taskContainer = document.getElementById('task-list');
        }
        var tasks = this.taskList.tasks;
        this.taskContainer.innerHTML = '<h2>'+this.taskList.name+'</h2>';
        if (tasks.length === 0) {
            this.taskContainer.innerHTML += '<p>There are no tasks. Add one!</p>';
        }
        for (var i = 0; i < tasks.length; i++) {
            this.taskContainer.innerHTML += this.buildTaskHtml(tasks[i]);
        }
    },
    buildTaskHtml: function(task) {
        var classes = ['task'];
        if (task.isComplete) {
            classes.push('is-complete');
        }
        return [
            '<div class="',(classes.join(' ')),'">',
                '<label>',
                    '<input type="checkbox" value="',task.id,'" class="btn-complete-task"', (task.isComplete ? ' checked="checked"' : ''),' />',
                    task.name,
                '</label>',
                '<a href="#" data-task-id="',task.id,'" class="btn-delete-task">X</a>',
            '</div>'
        ].join('');
    },
    setupEvents: function() {
        var app = this;
        this.element.addEventListener('click', function(event) {
            var target = event.target;
            if (target.classList.contains('btn-complete-task')) {
                app.onToggleTaskComplete(event);
            } else if (target.classList.contains('btn-delete-task')) {
                app.onDeleteTask(event);
            }
        });
        this.element.addEventListener('submit', function(event) {
            app.onTaskFormSubmit(event);
        });
    },
    save: function() {
        this.store.save(this.taskList);
    },
    onToggleTaskComplete: function(event) {
        var checkbox = event.target;
        var taskId = Number(checkbox.value);
        var task = this.taskList.find(taskId);
        task.isComplete = !task.isComplete;
        this.renderTasks(); 
        this.save();
    },
    onDeleteTask: function(event) {
        event.preventDefault();
        var button = event.target;
        var taskId = Number(button.getAttribute('data-task-id'));
        this.taskList.remove(taskId);
        this.save();
        this.renderTasks(); 
    },
    onTaskFormSubmit: function(event) {
        event.preventDefault();
        var form = event.target;
        var taskName = form.task_name.value;
        var task = new Task(taskName);
        this.taskList.add(task);
        this.save();
        this.renderTasks();
        form.reset();
    }
};