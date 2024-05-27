import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import ComboboxMail from '~/components/Admin/SendMail/ComboboxMail'
import uploadIcon from '~/assets/images/uploadpdf.png'

const SendMail = () => {
  return (
    <>
      <div className='place-content-center m-8 rounded p-6 shadow-xl shadow-neutral-400 w-2/3 mx-auto'>
        <div className='font-bold rounded text-3xl mb-8'>
          <span>Thư mới</span>
        </div>
        <div className='py-2 border-b-2 border-slate-200 flex items-center'>
          <span className='w-20 font-bold'>Đến</span>
          {/* <input type='text' className='w-full border-none rounded'></input> */}
          <ComboboxMail />
        </div>
        <div className='py-2 border-b-2 border-slate-200 flex items-center'>
          <span className='w-20 font-bold'>CC</span>
          <ComboboxMail />
          {/* <input type='text' className='w-full border-none rounded'></input> */}
        </div>
        <div className='py-2 border-b-2 border-slate-200 flex items-center'>
          <span className='w-20 font-bold'>Tiêu đề</span>
          <input type='text' className='border-none w-full rounded h-8' placeholder=''></input>
        </div>
        <h2 className='mt-8 font-bold mb-4'>Nội dung</h2>
        <CKEditor
          editor={ClassicEditor}
          data='<p>Go Youn-jung (Tiếng Hàn: 고윤정; sinh ngày 22 tháng 4 năm 1996) là nữ diễn viên và người mẫu người Hàn Quốc.[2] Cô xuất hiện lần đầu trong bộ phim truyền hình Chàng trai ngoại cảm (2019) và đã được công nhận với vai phụ trong phim Netflix Sweet Home: Thế giới ma quái (2020). Cô còn được biết đến qua các bộ phim truyền hình Trường luật (2021), Hoàn hồn (2022–2023) và phim gốc Disney+ Moving (2023) cũng như phim Săn lùng (2022).</p>'
          onReady={(editor) => {
            // You can store the "editor" and use when it is needed.
            console.log('Editor is ready to use!', editor)
          }}
          onChange={(event) => {
            console.log(event)
          }}
          onBlur={(event, editor) => {
            console.log('Blur.', editor)
          }}
          onFocus={(event, editor) => {
            console.log('Focus.', editor)
          }}
        />
        <div className='mt-4 text-center'>
          <input type='file' id='file-upload' className='hidden' />
          <label htmlFor='file-upload' className='cursor-pointer inline-flex items-center justify-center rounded-full'>
            <img src={uploadIcon} alt='Upload' className='w-30 h-20' />
          </label>
        </div>
      </div>
      <button className='py-2 px-6 mb-4 rounded bg-sky-800 text-white mt-4 text-center flex justify-center mx-auto hover:bg-sky-500 active:bg-sky-800 focus:outline-none focus:ring focus:ring-sky-300'>
        Gửi
      </button>
    </>
  )
}

export default SendMail
