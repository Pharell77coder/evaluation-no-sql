const API = "/users";
let currentUserId = null;

async function loadUsers(url = API) {
    const res = await fetch(url);
    const users = await res.json();
    const list = document.getElementById('userList');
    list.innerHTML = '';

    users.forEach(u => {
        const div = document.createElement('div');
        div.className = 'user-card';
        
        let adrText = "";
        u.addresses.forEach(a => { adrText += `<div>${a.street}</div>`; });
        
        div.innerHTML = `
            <div>
                <strong>${u.name}</strong> (${u.email})
                ${adrText}
                <small>Notifications: ${u.preferences.notifications ? 'OUI' : 'NON'}</small>
            </div>
            <div>
                <button onclick="fillForm('${u._id}', '${u.name}', '${u.email}', '${u.addresses.map(a => a.street).join('; ')}', ${u.preferences.notifications})">Modifier</button>
                <button class="delete" onclick="deleteUser('${u._id}')">Supprimer</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function fillForm(id, name, email, addresses, notifications) {
    currentUserId = id;
    document.getElementById('name').value = name;
    document.getElementById('email').value = email;
    document.getElementById('address').value = addresses;
    document.getElementById('notifs').checked = notifications;
    document.querySelector('button[type="submit"]').textContent = "Enregistrer les modifications";
}

document.getElementById('userForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const adrValue = document.getElementById('address').value;
    const adrList = adrValue.split(';').map(s => ({ street: s.trim() }));

    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        addresses: adrList,
        preferences: { 
            notifications: document.getElementById('notifs').checked, 
            theme: "light" 
        }
    };

    if (currentUserId) {
        await fetch(API + "/" + currentUserId, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        currentUserId = null;
        document.querySelector('button[type="submit"]').textContent = "Créer le profil";
    } else {
        await fetch(API, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
    }
    
    e.target.reset();
    loadUsers();
};

async function deleteUser(id) {
    await fetch(API + "/" + id, { method: 'DELETE' });
    loadUsers();
}

function loadAdvanced() {
    loadUsers(API + "/advanced");
}


async function searchUser() {
    const name = document.getElementById('searchName').value;
    
    if (name === "") {
        loadUsers();
        return;
    } else {
        const res = await fetch("/users/search/" + name);
        const users = await res.json();
        renderList(users); 
    }
}
function renderList(users) {
    const list = document.getElementById('userList');
    list.innerHTML = '';

    users.forEach(u => {
        const div = document.createElement('div');
        div.className = 'user-card';
        let adrText = "";
        u.addresses.forEach(a => { adrText += `<div>${a.street}</div>`; });
        
        div.innerHTML = `
            <div>
                <strong>${u.name}</strong> (${u.email})
                ${adrText}
                <small>Notifications: ${u.preferences.notifications ? 'OUI' : 'NON'}</small>
            </div>
            <div>
                <button onclick="fillForm('${u._id}', '${u.name}', '${u.email}', '${u.addresses.map(a => a.street).join('; ')}', ${u.preferences.notifications})">Modifier</button>
                <button class="delete" onclick="deleteUser('${u._id}')">Supprimer</button>
            </div>
        `;
        list.appendChild(div);
    });
}

async function loadUsers() {
    const res = await fetch("/users");
    const users = await res.json();
    renderList(users);
}



loadUsers();