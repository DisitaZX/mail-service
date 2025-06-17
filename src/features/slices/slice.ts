import { createSlice } from '@reduxjs/toolkit'
import { Status } from '../entities'

interface StatusState {
    currentStatus: Status | null
    // другие состояния, если нужны
}

const initialState: StatusState = {
    currentStatus: null,
}

export const statusSlice = createSlice({
    name: 'status',
    initialState,
    reducers: {
        setCurrentStatus: (state, action) => {
            state.currentStatus = action.payload
        },
        // другие редьюсеры
    },
})

export const { setCurrentStatus } = statusSlice.actions
export default statusSlice.reducer