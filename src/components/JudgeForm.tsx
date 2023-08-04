import axios from "axios";
import { useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";

const JudgeForm = () => {
  const [textAreaValue, setTextAreaValue] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [judgeDate, setJudgeDate] = useState<string>('');
  const [score, setScore] = useState<number | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextAreaValue(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(event.target.files === null) return;
    if(event.target.files.length === 0) return;
    const file = event.target.files[0];
    setSelectedFile(file);
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setScore(null);
    setJudgeDate('');
    setErrorMessages([]);
    try{
      const url = "https://titanic-checker-api.onrender.com/judge";
      const formData = new FormData();
      if(selectedFile){
        formData.append('file', selectedFile);
      } else if (textAreaValue) {
        formData.append("file", new Blob([textAreaValue], {type: "text/csv"}));
      } else {
        throw new Error("ファイルまたはテキストを入力してください。");
      }
      const response = await axios.post<JudgeAPIResponse>(url, formData);
      if(response.data.message){
        throw new Error(response.data.message);
      }
      if(response.data.status === "success"){
        setScore(response.data.score);
        setJudgeDate(new Date().toLocaleString());
      }
    } catch (error: any) {
      if(error.response){
        const errorMessages = error.response.data.errors;
        setErrorMessages(errorMessages);
      } else {
        setErrorMessages([error.message]);
      }
    }
  }
  
  return (
    <Container className="mt-2">
      <h1>タイタニック号 予測ジャッジ</h1>
      <p>CSVファイルの内容を貼り付けるか、CSVファイルを選択して送信すると、Testのスコアが表示されます。</p>
      {score && judgeDate && (
        <Alert variant="success">
          🎉 [{judgeDate}] Score: {score.toPrecision(5)}
        </Alert>
      )}
      {errorMessages.map((errorMessage, index) => {
        return <Alert key={index} variant="danger">Error: {errorMessage}</Alert>
      })}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="csvText" className="mb-3">
          <Form.Label>予測結果テキスト</Form.Label>
          <Form.Control as="textarea" rows={10} value={textAreaValue} onChange={handleTextAreaChange} />
        </Form.Group>
        <Form.Group controlId="csvFile" className="mb-3">
          <Form.Label>予測結果ファイル</Form.Label>
          <Form.Control type="file" accept="text/csv" onChange={handleFileChange} />
        </Form.Group>
        <Button variant="primary" type="submit">
          送信
        </Button>
      </Form>
    </Container>
  );
}

export default JudgeForm
