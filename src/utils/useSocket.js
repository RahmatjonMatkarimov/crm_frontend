import { io } from 'socket.io-client'
import { BASE_URL } from '@/api'

let socket = null

function getSocket() {
  if (!socket) {
    socket = io(BASE_URL)
  }
  return socket
}

function onCustomerCalled(callback) {
  const s = getSocket()
  s.on('customer:called', callback)
  return () => s.off('customer:called', callback)
}

export function useSocket() {
  return { getSocket, onCustomerCalled }
}
