import { Navigate } from "react-router-dom";

const Home = ({ username, setUsername, room, setRoom, socket }) => {
   // Add this
   const navigate = useNavigate(); 
   const joinRoom = () => {
    if (room !== '' && username !== '') {
      socket.emit('join_room', { username, room });
    }
    navigate('/chat', { replace: true });
  };
    return (
      <div className=''>
        <div className=''>
          <h1>{`<>Hari-Rooms</>`}</h1>
          <input className= '' placeholder='Username...' />
  
          <select className=''>
            <option>-- Select Room --</option>
            <option value='javascript'>JavaScript</option>
            <option value='node'>Node</option>
            <option value='express'>Express</option>
            <option value='react'>React</option>
          </select>
  
          <button className='btn btn-secondary'>Join Room</button>
        </div>
      </div>
    );
  };
  
  export default Home;