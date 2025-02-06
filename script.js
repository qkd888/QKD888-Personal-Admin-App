 // Navigation
 document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
     btn.addEventListener('click', () => {
         document.querySelector('.nav-btn.active').classList.remove('active');
         btn.classList.add('active');
         document.querySelector('.section.active').classList.remove('active');
         document.getElementById(btn.dataset.section).classList.add('active');
     });
 });

 // Tasks Management
 const taskInput = document.querySelector('.task-input');
 const todoList = document.querySelector('.todo-list');

 function loadTasks() {
     const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
     todoList.innerHTML = tasks.map(task => `
<li class="todo-item">
<span>${task}</span>
<button class="nav-btn" onclick="this.parentElement.remove(); saveTasks();">✓</button>
</li>
`).join('');
 }

 function saveTasks() {
     const tasks = Array.from(todoList.querySelectorAll('.todo-item span'))
         .map(span => span.textContent);
     localStorage.setItem('tasks', JSON.stringify(tasks));
 }

 taskInput.addEventListener('keypress', (e) => {
     if (e.key === 'Enter' && taskInput.value.trim()) {
         const li = document.createElement('li');
         li.className = 'todo-item';
         li.innerHTML = `
<span>${taskInput.value}</span>
<button class="nav-btn" onclick="this.parentElement.remove(); saveTasks();">✓</button>
`;
         todoList.appendChild(li);
         saveTasks();
         taskInput.value = '';
     }
 });

 // Notes Management
 const notesTextarea = document.querySelector('#notes textarea');
 notesTextarea.value = localStorage.getItem('notes') || '';
 notesTextarea.addEventListener('input', () => {
     localStorage.setItem('notes', notesTextarea.value);
 });

 // Quick Links
 document.querySelectorAll('.quick-link').forEach(link => {
     link.addEventListener('click', () => {
         window.open(link.dataset.url, '_blank');
     });
 });

 // Budget Management
 let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
 let total = 0;

 function updateTransactions() {
     const list = document.querySelector('.transaction-list');
     list.innerHTML = transactions.map(t => `
<div class="transaction-item ${t.type}">
<div>
    <strong>${t.description}</strong>
    <br>
    <small>${new Date(t.date).toLocaleDateString()}</small>
</div>
<div style="display: flex; gap: 10px; align-items: center;">
    <span>R${t.amount.toFixed(2)}</span>
    <button class="nav-btn" onclick="deleteTransaction(${t.id})">×</button>
</div>
</div>
`).join('');

     total = transactions.reduce((sum, t) =>
         sum + (t.type === 'income' ? t.amount : -t.amount), 0);
     document.getElementById('total').textContent = total.toFixed(2);
     localStorage.setItem('transactions', JSON.stringify(transactions));
 }

 function addTransaction(type) {
     const amount = parseFloat(document.getElementById(type).value);
     const description = document.getElementById(type + '-desc').value;
     if (amount && description) {
         transactions.push({
             id: Date.now(),
             type,
             amount,
             description,
             date: new Date().toISOString()
         });
         document.getElementById(type).value = '';
         document.getElementById(type + '-desc').value = '';
         updateTransactions();
     }
 }

 function deleteTransaction(id) {
     transactions = transactions.filter(t => t.id !== id);
     updateTransactions();
 }

 // Habits Management
 let habits = JSON.parse(localStorage.getItem('habits')) || {};
 const habitModal = document.getElementById('habit-modal');
 let selectedDay = null;

 function updateHabitGrid() {
     const grid = document.querySelector('.habit-grid');
     grid.innerHTML = '';

     for (let i = 1; i <= 7; i++) {
         const day = document.createElement('div');
         day.className = `habit-day${habits[i]?.length ? ' has-habits' : ''}`;
         day.innerHTML = `
<strong>${i}</strong>
<small>${habits[i]?.length || 0} habits</small>
`;
         day.onclick = () => openHabitModal(i);
         grid.appendChild(day);
     }
     localStorage.setItem('habits', JSON.stringify(habits));
 }

 function openHabitModal(day) {
     selectedDay = day;
     document.getElementById('selected-day').textContent = day;
     document.getElementById('habit-list').innerHTML = (habits[day] || [])
         .map((habit, index) => `
<div class="transaction-item">
    ${habit}
    <button class="nav-btn" onclick="deleteHabit(${index})">×</button>
</div>
`).join('');
     habitModal.style.display = 'block';
 }

 function closeHabitModal() {
     habitModal.style.display = 'none';
     selectedDay = null;
 }

 function addHabit() {
     const input = document.getElementById('habit-input');
     const habit = input.value.trim();
     if (habit && selectedDay) {
         habits[selectedDay] = habits[selectedDay] || [];
         habits[selectedDay].push(habit);
         input.value = '';
         updateHabitGrid();
         openHabitModal(selectedDay);
     }
 }

 function deleteHabit(index) {
     if (selectedDay && habits[selectedDay]) {
         habits[selectedDay].splice(index, 1);
         updateHabitGrid();
         openHabitModal(selectedDay);
     }
 }

 // Health Tracker
 let waterIntake = JSON.parse(localStorage.getItem('waterIntake')) || Array(8).fill(false);
 let exerciseLog = JSON.parse(localStorage.getItem('exerciseLog')) || [];

 function updateWaterTracker() {
     const tracker = document.querySelector('.water-tracker');
     tracker.innerHTML = '';

     waterIntake.forEach((active, i) => {
         const glass = document.createElement('div');
         glass.className = `water-glass${active ? ' active' : ''}`;
         glass.innerHTML = '💧';
         glass.onclick = () => toggleWaterGlass(i);
         tracker.appendChild(glass);
     });

     const completedGlasses = waterIntake.filter(Boolean).length;
     const percentage = (completedGlasses / 8) * 100;
     document.getElementById('water-amount').textContent = (completedGlasses * 250);
     document.getElementById('water-percentage').textContent = percentage.toFixed(1);

     localStorage.setItem('waterIntake', JSON.stringify(waterIntake));
 }

 function toggleWaterGlass(index) {
     waterIntake[index] = !waterIntake[index];
     updateWaterTracker();
 }

 function logExercise() {
     const activity = document.getElementById('exercise-input').value;
     const duration = document.getElementById('exercise-duration').value;

     if (activity && duration) {
         exerciseLog.push({
             id: Date.now(),
             activity,
             duration,
             date: new Date().toISOString()
         });

         document.getElementById('exercise-input').value = '';
         document.getElementById('exercise-duration').value = '';

         updateExerciseLog();
     }
 }

 function updateExerciseLog() {
     const log = document.getElementById('exercise-log');
     log.innerHTML = exerciseLog.map(entry => `
<div class="transaction-item">
<div>
    <strong>${entry.activity}</strong> - ${entry.duration} minutes
    <br>
    <small>${new Date(entry.date).toLocaleDateString()}</small>
</div>
<button class="nav-btn" onclick="deleteExercise(${entry.id})">×</button>
</div>
`).join('');

     localStorage.setItem('exerciseLog', JSON.stringify(exerciseLog));
 }

 function deleteExercise(id) {
     exerciseLog = exerciseLog.filter(entry => entry.id !== id);
     updateExerciseLog();
 }

 // Initialize everything
 window.onload = () => {
     loadTasks();
     updateTransactions();
     updateHabitGrid();
     updateWaterTracker();
     updateExerciseLog();
 };

 // Close modal when clicking outside
 window.onclick = (event) => {
     if (event.target === habitModal) {
         closeHabitModal();
     }
 };