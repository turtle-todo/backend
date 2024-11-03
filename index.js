import express from 'express';
import path from 'path';
import nunjucks from 'nunjucks';
import bodyParser from 'body-parser';
import fs from 'fs';
import mongoose from 'mongoose';

const __dirname = path.resolve();

const app = express();

//file path
const filePath = path.join(__dirname, 'data', 'writing.json');

// // view engine set
// app.set('view engine', 'html'); // main.html -> main(.html)

// // nunjucks
// nunjucks.configure('views', {
//   watch: true, // html 파일이 수정될 경우, 다시 반영 후 렌더링
//   express: app,
// })

// // middleware

// // main page GET
// app.get('/', (req, res) => {
//   //res.send('Main page Get Request');
//   // res.send('<h1>Hello Main Page</h1>');
//   // res.send(`
//   //   <h1>H1</h1>
//   //   <h1>H1</h1>
//   //   `);
//   res.sendFile(__dirname + '/public/main.html');
// });

// app.get('/write', (req, res) => {
//   res.render('write.html');
// });

// app.listen(3000, () => {
//   console.log('server is listening on port 3000');
// });



// body parser set
app.use(bodyParser.urlencoded({ extended: false })); // express 기본 모듈 사용
app.use(bodyParser.json());

// view engine set
app.set('view engine', 'html'); // main.html -> main(.html)

// nunjucks
nunjucks.configure('views', {
    watch: true, // html 파일이 수정될 경우, 다시 반영 후 렌더링
    express: app
})

// mongoose connect
mongoose
  .connect('mongodb://127.0.0.1:27017')
  .then(() => console.log('DB 연결 성공'))
  .catch((e) => console.error(e));


// mongoose set
const { Schema } = mongoose;

const WritingSchema = new Schema({
  title: String,
  contents: String,
  date: {
    type: Date,
    default: Date.now,
  }
});

const Writing = mongoose.model('Writing', WritingSchema);


// middleware
// main page GET
app.get('/', async (req, res) => {
    // const fileData = fs.readFileSync(filePath);
    // const writings = JSON.parse(fileData);

    let writings = await Writing.find({});

    // main.html 확인하면 list 라는 변수를 쓰고 있음
    res.render('main', { list: writings });
});

app.get('/write', (req, res) => {
    res.render('write');
});

app.post('/write', async (req, res) => {
    // request 안에 있는 내용을 처리
    // request.body
    const title = req.body.title;
    const contents = req.body.contents;
    // const date = req.body.date;

    // // 데이터 저장
    // // data/writing.json 안에 글 내용이 저장
    // const fileData = fs.readFileSync(filePath); //파일 읽기
    // // 리드파일싱크 노드제이에스가 비동기이기 때문에 동기로 실행되도록(이 작업 끝나고 다음게 실행되도록)
    // const writings = JSON.parse(fileData); //파일 변환

    // //request 데이터를 저장
    // writings.push({
    //   'title': title,
    //   'contents': contents,
    //   'date': date,
    // });

    // // data/writing.json 에 저장
    // fs.writeFileSync(filePath, JSON.stringify(writings));

    // mongoDB 에 저장
    const writing = new Writing({
      title: title,
      contents: contents,
    })
    const result = await writing.save()
      .then(() => {
        console.log('success');
        res.render('detail', { 'detail': { title: title, contents: contents } });
    }).catch(e => {
      console.error(e);
      res.render('write');
    });
    

    // res.render('detail', { 'detail': { title: title, contents: contents, date: date } });
});

app.get('/detail/:id', async (req, res) => {
  const id = req.params.id;
  const detail = await Writing.findOne({ _id: id }).then((result) => {
    res.render('detail', { 'detail': result });
  }).catch((err) => console.error(err));
})

app.get('/edit/:id', async (req, res) => {
  const id = req.params.id;

  const edit = await Writing.findOne({ _id: id }).then((result) => {
      res.render('detail', { 'edit': result })
  }).catch((err) => {
      console.error(err)
  })
})

app.post('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const title = req.body.title;
  const contents = req.body.contents;

  const edit = await Writing.replaceOne({ _id: id }, { title: title, contents: contents }).then((result) => {
      console.log('update success')
      res.render('detail', { 'detail': { 'id': id, 'title': title, 'contents': contents } });
  }).catch((err) => {
      console.error(err)
  })
})

app.post('/delete/:id', async (req, res) => {
  const id = req.params.id;

  const delete_content = await Writing.deleteOne({ _id: id }).then(() => {
    console.log('delete success');
    res.redirect('/');
  }).catch(e => console.error(e));
})


app.listen(3000, () => {
    console.log('Server is running');
});