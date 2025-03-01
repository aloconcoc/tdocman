import { Dialog, Listbox, Menu, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import ViewContract from '~/components/Admin/NewContract/ViewContract'
import {
  Cog6ToothIcon,
  EllipsisVerticalIcon,
  NoSymbolIcon,
  PaperAirplaneIcon,
  PlusIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
  ArrowUpOnSquareIcon,
  PencilIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteNewContract, getNewContract, getNewContractById } from '~/services/contract.service'
import DocumentIcon from '~/assets/svg/document'
import Pagination from '~/components/BaseComponent/Pagination/Pagination'
import Loading from '~/components/shared/Loading/Loading'
import moment from 'moment'
import { useMutation, useQuery } from 'react-query'
import { AxiosError } from 'axios'
import useToast from '~/hooks/useToast'
import EditNewContract from '~/components/Admin/NewContract/EditNewContract'
import { statusObject, statusRequest } from '~/common/const/status'
import { useAuth } from '~/context/authProvider'
import { permissionObject } from '~/common/const/permissions'
import { ADMIN } from '~/common/const/role'
import UrgentIcon from '~/assets/svg/urgentIcon'
import { Tooltip } from 'flowbite-react'
import { AiOutlineFileDone } from 'react-icons/ai'
import { FaClock, FaUserCheck, FaUserClock, FaUserTimes } from 'react-icons/fa'
import { MdEditDocument, MdOutlineDownloadDone } from 'react-icons/md'
import { HiMiniDocumentCheck } from 'react-icons/hi2'
import LoadingIcon from '~/assets/LoadingIcon'
import { SubmitHandler, useForm } from 'react-hook-form'
import ContractHistory from '../ContractHistory'
import { deleteAppendices, getAppendicesContactAll } from '~/services/contract.appendices.service'
import SendMailUpdateStatus from '~/components/Admin/Appendices/SendMailUpdateStatus'
import { useNotification } from '~/context/notiProvider'
import EditAppendicesContract from '~/components/Admin/Appendices/EditAppendicesContract'
export interface DataContract {
  id: string
  file: string
  name: string
  status: string
  urgent: boolean
  statusCurrent:
    | 'NEW'
    | 'WAIT_APPROVE'
    | 'APPROVED'
    | 'APPROVE_FAIL'
    | 'WAIT_SIGN_A'
    | 'SIGN_A_OK'
    | 'SIGN_A_FAIL'
    | 'WAIT_SIGN_B'
    | 'SIGN_B_OK'
    | 'SIGN_B_FAIL'
    | 'SUCCESS'
  createdBy: string
  approvedBy: string | null
  canDelete: boolean
  canSend: boolean
  canSendFotMng: boolean
  canUpdate: boolean
  approved: boolean
  createdDate: string
}
type ActionType = {
  id: number
  title: string | ReactNode
  color?: string
  disable?: any
  callback: any
}
type FormSearch = {
  searchText: string
}
type STATUS = 'ADMIN' | 'OFFICE_ADMIN' | 'SALE' | 'OFFICE_STAFF'
const AppendicesContract = () => {
  const navigate = useNavigate()
  const { successNotification, errorNotification } = useToast()
  const [selectedContract, setSelectedContract] = useState<DataContract | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [changeStatus, setChangeStatus] = useState(false)
  const [historyModal, setHistoryModal] = useState(false)
  const { realReload } = useNotification()
  const [statusContract, setStatusContract] = useState<any>({
    id: 1,
    title: 'Quản lí hợp đồng',
    status: 'MANAGER_CONTRACT'
  })
  const [status, setStatus] = useState<number>(0)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPage, setTotalPage] = useState(1)
  const prevPageRef = useRef(page)
  const prevSizeRef = useRef(size)
  const { user } = useAuth()
  const { id } = useParams()
  const permissionUser: STATUS = useMemo(() => {
    if (user?.role == ADMIN || user?.permissions.includes(permissionObject.MANAGER)) return ADMIN
    else if (user?.permissions.includes(permissionObject.OFFICE_ADMIN)) return 'OFFICE_ADMIN'
    else if (user?.permissions.includes(permissionObject.SALE)) return 'SALE'
    else return 'OFFICE_STAFF'
  }, [user])

  const handleCloseModal = () => {
    setDeleteModal(false)
    setOpenModal(false)
    setEditModal(false)
    setHistoryModal(false)
    setChangeStatus(false)
    setStatus(0)
    setSelectedContract(null)
  }
  const handleCloseHistoryModal = () => {
    setHistoryModal(false)
  }

  const handlePageChange = (page: any) => {
    setPage(page - 1)
  }

  const { data, isLoading, refetch, isFetching } = useQuery(
    ['contract-appendices', user?.id, statusContract?.status, realReload],
    () => getAppendicesContactAll(id as string, page, size, statusContract?.status as string),
    {
      onSuccess: (response) => {
        setTotalPage(response?.object?.totalPages)
      },
      onError: (error: AxiosError<{ message: string }>) => {
        errorNotification(error.response?.data?.message || 'Lỗi hệ thống')
      }
    }
  )
  const { data: dataContract, isLoading: loadingContract } = useQuery('get-contract-detail', () =>
    getNewContractById(id as string)
  )

  const actionSale: ActionType[] = [
    {
      id: 1,
      title: (
        <>
          <ArrowUpOnSquareIcon className='h-5' /> Trình duyệt
        </>
      ),
      color: 'text-blue-700',
      disable: (d: any) => !d?.canSend || d?.status == 'SUCCESS' || d?.statusCurrent == 'SUCCESS',
      callback: (d: any) => {
        setSelectedContract(d)
        setStatus(1)
        setChangeStatus(true)
      }
    },
    {
      id: 2,
      title: (
        <>
          <PaperAirplaneIcon className='h-5' /> Gửi khách hàng
        </>
      ),
      color: 'text-teal-700',
      disable: (d: any) => !d?.canSendForCustomer || d?.status == 'SUCCESS' || d?.statusCurrent == 'SUCCESS',
      callback: (d: any) => {
        setSelectedContract(d)
        setStatus(7)
        setChangeStatus(true)
      }
    },
    {
      id: 4,
      title: (
        <>
          <Cog6ToothIcon className='h-5' /> Sửa
        </>
      ),
      color: 'text-violet-700',
      disable: (d: any) => !d.canUpdate,
      callback: (d: any) => {
        setEditModal(true)
        setSelectedContract(d)
      }
    },
    {
      id: 5,
      title: (
        <>
          <NoSymbolIcon className='h-5' /> Xóa
        </>
      ),
      color: 'text-red-700',
      disable: (d: any) => !d.canDelete,
      callback: (d: any) => {
        setDeleteModal(true)
        setSelectedContract(d)
      }
    }
  ]
  const actionOfficeAdmin: ActionType[] = [
    {
      id: 1,
      title: (
        <>
          <ArrowUpOnSquareIcon className='h-5' /> Trình ký
        </>
      ),
      color: 'text-blue-950',
      disable: (d: any) => !d?.canSendForMng,
      callback: (d: any) => {
        setSelectedContract(d)
        setStatus(4)
        setChangeStatus(true)
      }
    },
    {
      id: 2,
      title: (
        <>
          <ArrowUturnLeftIcon className='h-5' /> Xác nhận duyệt
        </>
      ),
      color: 'text-green-700',
      disable: (d: any) => !d.canApprove,
      callback: (d: any) => {
        setSelectedContract(d)
        setStatus(2)
        setChangeStatus(true)
      }
    },

    {
      id: 4,
      title: (
        <>
          <ArrowUturnLeftIcon className='h-5' /> Từ chối duyệt
        </>
      ),
      color: 'text-orange-700',
      disable: (d: any) => !d.canApprove,
      callback: (d: any) => {
        setSelectedContract(d)
        setStatus(3)
        setChangeStatus(true)
      }
    },
    {
      id: 7,
      title: (
        <>
          <PaperAirplaneIcon className='h-5' /> Gửi khách hàng
        </>
      ),
      color: 'text-teal-700',
      disable: (d: any) => !d.canSendForCustomer,
      callback: (d: any) => {
        setSelectedContract(d)
        setStatus(7)
        setChangeStatus(true)
      }
    },
    {
      id: 5,
      title: (
        <>
          <Cog6ToothIcon className='h-5' /> Sửa
        </>
      ),
      color: 'text-violet-700',
      disable: (d: any) => !d?.canUpdate,
      callback: (d: any) => {
        setEditModal(true)
        setSelectedContract(d)
      }
    },
    {
      id: 6,
      title: (
        <>
          <NoSymbolIcon className='h-5' /> Xóa
        </>
      ),
      color: 'text-red-700',
      disable: (d: any) => !d?.canDelete,
      callback: (d: any) => {
        setDeleteModal(true)
        setSelectedContract(d)
      }
    }
  ]
  const actionAdmin: ActionType[] = [
    {
      id: 1,
      title: (
        <>
          <PencilIcon className='h-5' /> Ký hợp đồng
        </>
      ),
      color: 'text-green-700',
      disable: (d: any) => {
        const statusPL = user?.email == d.createdBy ? ['NEW'] : ['WAIT_SIGN_A']
        return !statusPL.includes(d?.statusCurrent)
      },
      callback: (d: any) => {
        navigate(`/view/${d?.id}/sign-appendices/1`)
      }
    },
    {
      id: 2,
      title: (
        <>
          <ArrowUturnLeftIcon className='h-5' /> Từ chối ký
        </>
      ),
      color: 'text-orange-700',
      disable: (d: any) => {
        const statusPL = user?.email == d.createdBy ? [] : ['WAIT_SIGN_A']
        return !statusPL.includes(d?.statusCurrent)
      },
      callback: (d: any) => {
        setSelectedContract(d)
        setStatus(6)
        setChangeStatus(true)
      }
    },
    {
      id: 6,
      title: (
        <>
          <PaperAirplaneIcon className='h-5' /> Gửi khách hàng
        </>
      ),
      color: 'text-teal-700',
      disable: (d: any) => {
        const statusPL = user?.email == d.createdBy ? ['SIGN_A_OK'] : ['']
        return !statusPL.includes(d?.statusCurrent)
      },
      callback: (d: any) => {
        setSelectedContract(d)
        setStatus(7)
        setChangeStatus(true)
      }
    },
    {
      id: 4,
      title: (
        <>
          <Cog6ToothIcon className='h-5' /> Sửa
        </>
      ),
      color: 'text-violet-700',
      disable: (d: any) => {
        const statusPL = user?.email == d.createdBy ? ['NEW', 'SIGN_B_FAIL'] : ['SIGN_A_FAIL']
        return !statusPL.includes(d?.statusCurrent)
      },
      callback: (d: any) => {
        setEditModal(true)
        setSelectedContract(d)
      }
    },
    {
      id: 5,
      title: (
        <>
          <NoSymbolIcon className='h-5' /> Xóa
        </>
      ),
      color: 'text-red-700',
      disable: (d: any) => {
        const statusPL = user?.email == d.createdBy ? ['NEW', 'SIGN_B_FAIL'] : ['SIGN_A_FAIL']
        return !statusPL.includes(d?.statusCurrent)
      },
      callback: (d: any) => {
        setDeleteModal(true)
        setSelectedContract(d)
      }
    }
  ]
  const saleContract = [
    {
      id: 1,
      title: (
        <div className='flex items-center justify-start gap-2 '>
          <MdEditDocument />
          <div className='w-[90%] truncate ...'>Quản lí hợp đồng</div>
        </div>
      ),
      status: 'MANAGER_CONTRACT'
    },
    {
      id: 2,
      title: (
        <div className='flex items-center gap-2'>
          <FaClock />
          <div className='w-[90%] truncate ...'> Đợi duyệt</div>
        </div>
      ),
      status: 'WAIT_APPROVE'
    },
    {
      id: 3,
      title: (
        <div className='flex items-center gap-2'>
          <MdOutlineDownloadDone />
          <div className='w-[90%] truncate ...'> Đã được duyệt</div>
        </div>
      ),
      status: 'APPROVED'
    },
    {
      id: 4,
      title: (
        <div className='flex items-center gap-2'>
          <FaUserClock />
          <div className='w-[90%] truncate ...'> Chờ ký</div>
        </div>
      ),
      status: 'WAIT_SIGN'
    },
    {
      id: 5,
      title: (
        <div className='flex items-center gap-2'>
          <FaUserCheck />
          <div className='w-[90%] truncate ...'>Đã ký</div>
        </div>
      ),
      status: 'SIGN_OK'
    },
    {
      id: 7,
      title: (
        <div className='flex items-center gap-2'>
          <AiOutlineFileDone />
          <div className='w-[90%] truncate ...'> Đã Hoàn thành</div>
        </div>
      ),
      status: 'SUCCESS'
    }
  ]
  const adminOfficeContract = [
    {
      id: 1,
      title: (
        <div className='flex items-center justify-start gap-2 '>
          <MdEditDocument />
          <div className='w-[90%] truncate ...'>Quản lí hợp đồng</div>
        </div>
      ),
      status: 'MANAGER_CONTRACT'
    },
    {
      id: 2,
      title: (
        <div className='flex items-center gap-2'>
          <FaClock />
          <div className='w-[90%] truncate ...'> Cần duyệt</div>
        </div>
      ),
      status: 'WAIT_APPROVE'
    },
    {
      id: 3,
      title: (
        <div className='flex items-center gap-2'>
          <MdOutlineDownloadDone />
          <div className='w-[90%] truncate ...'> Đã duyệt</div>
        </div>
      ),
      status: 'APPROVED'
    },
    {
      id: 4,
      title: (
        <div className='flex items-center gap-2'>
          <FaUserClock />
          <div className='w-[90%] truncate ...'> Chờ ký</div>
        </div>
      ),
      status: 'WAIT_SIGN'
    },
    {
      id: 5,
      title: (
        <div className='flex items-center gap-2'>
          <HiMiniDocumentCheck />
          <div className='w-[90%] truncate ...'> Đã ký</div>
        </div>
      ),
      status: 'SIGN_OK'
    },
    {
      id: 6,
      title: (
        <div className='flex items-center gap-2'>
          <AiOutlineFileDone />
          <div className='w-[90%] truncate ...'> Đã Hoàn thành</div>
        </div>
      ),
      status: 'SUCCESS'
    }
  ]
  const adminContract = [
    {
      id: 1,
      title: (
        <div className='flex items-center justify-start gap-2 '>
          <MdEditDocument />
          <div className='w-[90%] truncate ...'>Quản lí hợp đồng</div>
        </div>
      ),
      status: 'MANAGER_CONTRACT'
    },
    {
      id: 2,
      title: (
        <div className='flex items-center gap-2'>
          <FaUserClock />
          <div className='w-[90%] truncate ...'> Chờ ký</div>
        </div>
      ),
      status: 'WAIT_SIGN'
    },
    {
      id: 3,
      title: (
        <div className='flex items-center gap-2'>
          <FaUserCheck />
          <div className='w-[90%] truncate ...'> Đã ký</div>
        </div>
      ),
      status: 'SIGN_OK'
    },
    {
      id: 4,
      title: (
        <div className='flex items-center gap-2'>
          <AiOutlineFileDone />
          <div className='w-[90%] truncate ...'> Đã Hoàn thành</div>
        </div>
      ),
      status: 'SUCCESS'
    }
  ]
  const actionTable = {
    ADMIN: actionAdmin,
    SALE: actionSale,
    OFFICE_ADMIN: actionOfficeAdmin,
    OFFICE_STAFF: []
  }
  const menuContract = {
    ADMIN: adminContract,
    SALE: saleContract,
    OFFICE_ADMIN: adminOfficeContract,
    OFFICE_STAFF: []
  }
  const deleteTemplate = useMutation(deleteAppendices, {
    onSuccess: () => {
      successNotification('Xóa thành công!')
      handleCloseModal()
      refetch()
    },
    onError: (error: AxiosError<{ message: string }>) => {
      errorNotification(error.response?.data?.message || 'Lỗi hệ thống')
    }
  })
  const handleDelete = () => {
    if (selectedContract) deleteTemplate.mutate(selectedContract.id)
  }

  useEffect(() => {
    if (prevPageRef.current !== page || prevSizeRef.current !== size) {
      prevPageRef.current = page
      prevSizeRef.current = size
      refetch()
    }
  }, [page, refetch, size])

  return (
    <div className='bg-[#e8eaed] h-full overflow-auto'>
      <div className='flex gap-3 justify-between w-full py-3 h-[60px] px-3'>
        <div className='text-[23px] w-full'>
          Phụ lục hợp đồng cho hợp đồng: <span className='font-bold'>{dataContract?.object?.name}</span> số:{' '}
          <span className='font-bold'>{dataContract?.object?.number}</span>
        </div>
        <button
          type='button'
          onClick={() => navigate(`/appendices-create/${id}`)}
          className='rounded-md justify-center w-[180px] flex gap-1 bg-main-color px-4 py-2 text-sm font-medium text-white hover:bg-hover-main focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75'
        >
          <PlusIcon className='h-5 w-5' /> Thêm mới
        </button>
      </div>
      <div className='flex h-[calc(100%-70px)] flex-col gap-2 md:flex-row justify-start sm:justify-between px-3'>
        <div className='flex gap-2 md:flex-col w-full h-fit md:h-full md:w-[15%] bg-white shadow-md overflow-auto'>
          {menuContract[permissionUser]?.map((t: any) => (
            <div
              key={t.id}
              className={`cursor-pointer text-xs sm:text-sm md:text-md h-[30px] px-3 py-1 ${statusContract?.id == t.id ? 'bg-main-color text-white' : 'text-black'} hover:bg-hover-main hover:text-white`}
              onClick={() => setStatusContract(t)}
            >
              {t?.title}
            </div>
          ))}
        </div>
        <div className='w-full md:w-[84%] h-full  overflow-auto'>
          <div
            className={`${data != null && data?.object?.content?.length != 0 && !isLoading && !isFetching ? 'overflow-auto' : 'overflow-hidden'}`}
          >
            <div className='shadow-md sm:rounded-lg h-fit'>
              <table className='w-full text-sm text-left rtl:text-right text-black dark:text-gray-400 '>
                <thead className=' text-xs text-black bg-gray-50 dark:bg-gray-700 dark:text-gray-400 '>
                  <tr>
                    <th className='px-3 py-3 w-[5%]' align='center'>
                      STT
                    </th>
                    <th className='px-3 py-3 w-[40%]'>Tên hợp đồng</th>
                    <th className='px-3 py-3 w-[20%]'>Người tạo</th>
                    <th scope='col' className='px-3 py-3' align='center'>
                      Ngày tạo
                    </th>
                    <th scope='col' className='px-3 py-3' align='center'>
                      Trạng thái
                    </th>
                    <th className='px-3 py-3 ' align='center'>
                      Chi tiết
                    </th>

                    <th className='px-3 py-3 w-[30px]'></th>
                  </tr>
                </thead>
                <tbody className='w-full '>
                  {!isLoading && !isFetching ? (
                    data?.object?.content?.map((d: DataContract, index: number) => (
                      <tr
                        key={d.id}
                        className={`${d.status != 'SUCCESS' && d.urgent ? 'text-red-700 font-semibold' : ''} w-full bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600`}
                      >
                        <td className='px-3 py-4' align='center'>
                          {page * size + index + 1 < 10 ? `0${page * size + index + 1}` : page * size + index + 1}
                        </td>
                        <td className={`px-3 py-4`}>
                          <div className='flex items-center gap-4'>
                            {d.name}
                            {d.status != 'SUCCESS' && d.urgent && (
                              <Tooltip content='Cấp bách'>
                                <UrgentIcon className='w-6 h-6' />
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className='px-3 py-4'>{d.createdBy}</td>
                        <td className='px-3 py-4' align='center'>
                          {d?.createdDate ? moment(d?.createdDate).format('DD/MM/YYYY') : d?.createdDate}
                        </td>
                        <td
                          className={`px-3 py-4 font-semibold ${statusObject[d.statusCurrent]?.color}`}
                          align='center'
                        >
                          {d.statusCurrent ? statusObject[d.statusCurrent]?.title?.[permissionUser] : ''}
                        </td>
                        <td className='px-3 py-4' align='center'>
                          <div
                            className='cursor-pointer text-blue-500 hover:underline'
                            onClick={() => {
                              navigate(`/appendices/${id}/detail/${d.id}`)
                              // setSelectedContract(d)
                              // setOpenModal(true)
                            }}
                          >
                            Xem
                          </div>
                        </td>
                        <td className='px-3 py-4'>
                          <Menu as='div' className='relative inline-block text-left '>
                            <Menu.Button className='flex justify-center items-center gap-3 cursor-pointer hover:text-blue-500'>
                              <EllipsisVerticalIcon className='h-7 w-7' title='Hành động' />
                            </Menu.Button>

                            <Transition
                              as={Fragment}
                              enter='transition ease-out duration-100'
                              enterFrom='transform opacity-0 scale-95'
                              enterTo='transform opacity-100 scale-100'
                              leave='transition ease-in duration-75'
                              leaveFrom='transform opacity-100 scale-100'
                              leaveTo='transform opacity-0 scale-95'
                            >
                              <Menu.Items className='absolute right-4 -top-10 z-50 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none'>
                                {actionTable[permissionUser]?.map((action: ActionType) => (
                                  <Menu.Item key={action.id} disabled={action.disable(d)}>
                                    {({ active }) => (
                                      <button
                                        onClick={() => action.callback(d)}
                                        className={`group flex w-full items-center ${action.disable(d) ? 'text-gray-300' : active ? 'bg-blue-500 text-white' : action?.color} gap-3 rounded-md px-2 py-1 text-sm `}
                                      >
                                        {action.title}
                                      </button>
                                    )}
                                  </Menu.Item>
                                ))}
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <></>
                  )}
                </tbody>
              </table>
              {(isLoading || isFetching) && (
                <Loading loading={isLoading || isFetching}>
                  <div className='w-full min-h-[60vh] opacity-75 bg-gray-50 flex items-center justify-center'></div>
                </Loading>
              )}

              {!isLoading && !isFetching && (data == null || data?.object?.content?.length == 0) && (
                <div className='w-full min-h-[60vh] opacity-75 bg-gray-50 flex items-center justify-center'>
                  <div className='flex flex-col justify-center items-center opacity-60'>
                    <DocumentIcon />
                    Chưa có hợp đồng
                  </div>
                </div>
              )}
            </div>
            {!isLoading && !isFetching && data && data?.object?.content?.length != 0 && (
              <Pagination
                totalPages={totalPage}
                currentPage={page + 1}
                size={size}
                setSize={setSize}
                setPage={setPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
      {/* Modal thay đổi trạng thái hợp đồng */}
      <Transition appear show={changeStatus} as={Fragment}>
        <Dialog as='div' className='relative z-50 w-[90vw]' onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-[100vw] md:w-[90vw] md:h-[94vh] transform overflow-hidden rounded-md bg-white p-4 text-left align-middle shadow-xl transition-all'>
                  <div className='flex justify-between mb-2'>
                    <div className='font-semibold'>{statusRequest[status]?.title}</div>
                    <div className='flex gap-3 items-center'>
                      <XMarkIcon className='h-5 w-5 cursor-pointer' onClick={() => handleCloseModal()} />
                    </div>
                  </div>
                  <SendMailUpdateStatus
                    id={selectedContract?.id}
                    status={status}
                    closeModal={handleCloseModal}
                    refetch={refetch}
                    dataC={dataContract?.object}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* Modal xem chi tiết hợp đồng */}
      <Transition appear show={openModal} as={Fragment}>
        <Dialog as='div' className='relative z-50 w-[90vw]' onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-[100vw] md:w-[90vw] md:h-[94vh] transform overflow-hidden rounded-md bg-white p-4 text-left align-middle shadow-xl transition-all'>
                  <div className='flex justify-between mb-2'>
                    <div className='font-semibold'>Xem hợp đồng</div>
                    <div className='flex gap-3 items-center'>
                      <Listbox>
                        <div className='relative'>
                          <Listbox.Button className='px-4 py-2 cursor-default rounded-sm bg-blue-500 text-white flex justify-center text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm'>
                            Lịch sử hợp đồng
                          </Listbox.Button>
                          <Transition
                            as={Fragment}
                            leave='transition ease-in duration-100'
                            leaveFrom='opacity-100'
                            leaveTo='opacity-0'
                          >
                            <Listbox.Options className='absolute mt-1 w-[40vw] md:w-[30vw] right-0 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm'>
                              <Listbox.Option
                                key='history'
                                className={({ active }) =>
                                  `cursor-default select-none relative py-2 pl-4 pr-4 ${
                                    active ? 'text-amber-900' : 'text-gray-900'
                                  }`
                                }
                                value='history'
                              >
                                {() => <ContractHistory selectedContract={selectedContract?.id} />}
                              </Listbox.Option>
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                      <XMarkIcon className='h-5 w-5 cursor-pointer' onClick={() => handleCloseModal()} />
                    </div>
                  </div>

                  <ViewContract src={selectedContract?.file} />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* Modal chỉnh sửa hợp đồng */}
      <Transition appear show={editModal} as={Fragment}>
        <Dialog as='div' className='relative z-50 w-[90vw]' onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-[100vw] md:w-[90vw] md:h-[94vh] transform overflow-hidden rounded-md bg-white p-4 text-left align-middle shadow-xl transition-all'>
                  <div className='flex justify-between mb-2'>
                    <div className='font-semibold'>Chỉnh sửa</div>
                    <XMarkIcon className='h-5 w-5 mr-3 mb-3 cursor-pointer' onClick={handleCloseModal} />
                  </div>
                  <EditAppendicesContract
                    selectedContract={selectedContract}
                    handleCloseModal={handleCloseModal}
                    refetch={refetch}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* Modal hiển thị lịch sử hợp đồng */}
      <Transition appear show={historyModal} as={Fragment}>
        <Dialog as='div' className='relative z-50 w-[25vw]' onClose={handleCloseHistoryModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className=' w-[50vw] md:w-[40vw] md:h-[30vh] transform overflow-y-auto rounded-md bg-white p-4 text-left align-middle shadow-xl transition-all'>
                  <div className='flex justify-between mb-2'>
                    <p className='font-semibold'>Lịch sử hợp đồng</p>
                    <XMarkIcon className='h-5 w-5 mr-3 mb-3 cursor-pointer' onClick={handleCloseHistoryModal} />
                  </div>
                  <ContractHistory selectedContract={selectedContract?.id} />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* Modal xóa hợp đồng */}
      <Transition appear show={deleteModal} as={Fragment}>
        <Dialog as='div' className='relative z-50 w-[90vw]' onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/25' />
          </Transition.Child>
          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full  items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-[100vw] md:w-[40vw] md:h-fit transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title as='h3' className='text-lg font-medium leading-6 text-gray-900'>
                    Xóa hợp đồng
                  </Dialog.Title>
                  <div>
                    <div>Bạn có chắc chắn với quyết định của mình?</div>
                    <div className='w-full flex justify-end mt-6'>
                      <button
                        type='button'
                        disabled={deleteTemplate?.isLoading}
                        className='middle  none center mr-4 rounded-lg bg-red-500 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-[#ff00002f] focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'
                        data-ripple-light='true'
                        onClick={() => handleDelete()}
                      >
                        {deleteTemplate?.isLoading ? <LoadingIcon /> : 'Xác nhận'}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
export default AppendicesContract
