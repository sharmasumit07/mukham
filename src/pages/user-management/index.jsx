import React, { useState } from 'react'
import UserList from '../../@core/user-management/UserList'
import UserProfilePage from "../../@core/user-management/UserProfilePage"

function UserManagement() {
    const [selectedUser, setSelectedUser] = useState(null)
    return (
        <>
            {selectedUser == null ? <UserList setSelectedUser={setSelectedUser} /> : <UserProfilePage selectedUser={selectedUser} setSelectedUser={setSelectedUser} />}
        </>
    )
}

export default UserManagement;