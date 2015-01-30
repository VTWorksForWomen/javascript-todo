function Task(name) {
    this.name = name;
    this.createdAt = new Date();
}

Task.prototype = {
    name: '',
    isComplete: false,
    createdAt: null
};