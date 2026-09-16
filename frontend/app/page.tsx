import Image from "next/image";



export default function Home() {
  const arr = [1, 2, 43, 1];
  return (
    <div>
      <h1>{arr.map(
        number => (<p>{number}</p>)
      )}</h1>
    </div>
  );
}
