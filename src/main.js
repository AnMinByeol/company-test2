import React, { useState, useEffect } from "react";
import "./App.css";
import DaumPostcode from "react-daum-postcode";
import Modal from "react-modal";

// 지역 코드에 따른 텍스트 반환
function getRegionText(regionCd) {
  switch (regionCd) {
    case 1:
      return "도내";
    case 2:
      return "도외";
    case 3:
      return "기타";
    default:
      return "";
  }
}

// 정산 방법 코드에 따른 텍스트 반환
function getCalText(calCd) {
  console.log(calCd);
  switch (calCd) {
    case 1:
      return "고산농협";
    case 2:
      return "직접정산";
    case 3:
      return "기타";
    default:
      return "";
  }
}

// 사용 여부 코드에 따른 텍스트 반환
function getUseText(useYn) {
  switch (useYn) {
    case "1":
      return "Y";
    case "2":
      return "N";
    default:
      return "";
  }
}

function Main() {
  // 상태 변수 정의
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [shipmentPlan, setShipmentPlan] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState({
    custCd: "",
    custNm: "",
    regionCd: "",
    calCd: "",
    shipmentYn: "N",
    telNo: "",
    faxNo: "",
    postNo: "",
    addStd: "",
    addDtl: "",
    manNm: "",
    manTelNo: "",
    invoiceMail: "",
    useYn: "1",
  });
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectedTdIndex, setSelectedTdIndex] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const [regionCd, setRegionCd] = useState([]);
  const [calCd, setCalCd] = useState([]);
  const [useYn, setUseYn] = useState([]);

  // 포지셔닝
  let data = [1, 2, 3, 4, 5];
  let [btnActive, setBtnActive] = useState("");

  // 우편번호
  const [zipCode, setZipcode] = useState("");
  const [roadAddress, setRoadAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [newCustomerData, setNewCustomerData] = useState({
    custCd: "",
    custNm: "",
    regionCd: "",
    calCd: "",
    useYn: "1",
  });

  // "추가" 아이콘을 클릭했을 때 실행되는 함수
  const [formData, setFormData] = useState({
    custCd: "",
    custNm: "",
    regionCd: "",
    calCd: "",
    shipmentYn: "",
    telNo: "",
    faxNo: "",
    postNo: "",
    addStd: "",
    addDtl: "",
    manNm: "",
    manTelNo: "",
    invoiceMail: "",
    useYn: "",
  });

  const [errors, setErrors] = useState({
    custCd: "",
    custNm: "",
    regionCd: "",
    calCd: "",
    shipmentYn: "",
    telNo: "",
    faxNo: "",
    postNo: "",
    addStd: "",
    addDtl: "",
    manNm: "",
    manTelNo: "",
    invoiceMail: "",
    useYn: "",
  });

  // API 엔드포인트 및 URL 정의
  const serverUrl = "http://133.186.221.46:8090/";
  const commonCodeApiEndpoint = "test/api/commonCode";
  const customerApiEndpoint = "test/api/search/customer";
  const commonCodeUrl = `${serverUrl}${commonCodeApiEndpoint}`;
  const customerUrl = `${serverUrl}${customerApiEndpoint}`;

  // 테이블 컬럼 정의
  const columns = [
    { headerName: "번호", field: "number" },
    { headerName: "고객사코드", field: "custCd" },
    { headerName: "고객사명", field: "custNm" },
    { headerName: "지역", field: "regionCd" },
    { headerName: "정산방법", field: "calCd" },
    { headerName: "사용여부", field: "useYn" },
  ];

  // 데이터 조회 함수
  const fetchData = async () => {
    try {
      const [commonCodeResponse, customerResponse] = await Promise.all([
        fetch(commonCodeUrl),
        fetch(customerUrl),
      ]);

      console.log("commonCodeResponse :::: ", commonCodeResponse);
      console.log("customerResponse :::: ", customerResponse);

      if (!commonCodeResponse.ok || !customerResponse.ok) {
        throw new Error("네트워크 응답이 올바르지 않습니다");
      }

      const [commonCodeResult, customerResult] = await Promise.all([
        commonCodeResponse.json(),
        customerResponse.json(),
      ]);

      console.log("commonCodeResult :::: ", commonCodeResult);
      console.log("customerResult :::: ", customerResult);

      if (
        commonCodeResult.code === "0" &&
        Array.isArray(commonCodeResult.data)
      ) {
        // 공통 코드 데이터 사용
      }

      if (customerResult.code === "0" && Array.isArray(customerResult.data)) {
        setRowData(customerResult.data);
      }
    } catch (error) {
      console.error("데이터를 가져오는 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    test("CAL_CD").then((res) => setCalCd(res.data));
    test("REGION_CD").then((res) => setRegionCd(res.data));
    test("USE_YN").then((res) => setUseYn(res.data));
  }, []);

  async function test(code) {
    const body = JSON.stringify({ comCd: code });
    const response = await fetch(commonCodeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
    const data = await response.json(); //const data await 추가
    return data;
  }

  // 데이터 조회 함수
  const list = async () => {
    try {
      // 필터링할 조건을 담을 변수
      const filters = {};

      // 각 필터링 항목에 대한 검사 및 설정
      if (searchParams.regionCd !== "") {
        filters.regionCd = searchParams.regionCd;
      }

      if (searchParams.calCd !== "") {
        filters.calCd = searchParams.calCd;
      }

      if (searchParams.useYn !== "") {
        filters.useYn = searchParams.useYn;
      }

      // 검색어가 입력된 경우에만 추가
      if (searchParams.custNm) {
        filters.custNm = searchParams.custNm;
      }

      const response = await fetch(customerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error("네트워크 응답이 올바르지 않습니다");
      }

      const result = await response.json();

      if (result.code === "0" && Array.isArray(result.data)) {
        setRowData(result.data);
        setIsReady(true);
      }
    } catch (error) {
      console.error("데이터를 가져오는 중 오류 발생:", error);
    }
  };

  // 검색 파라미터 변경 핸들러
  const handleSearchParamsChange = (field, value) => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      [field]: value,
    }));
  };

  // 검색 버튼 클릭 핸들러
  const handleSearchClick = () => {
    list();
  };

  // 사용 여부 체크박스 변경 핸들러
  const handleUseYnCheckboxChange = (rowIndex) => {
    const updatedRowData = [...rowData];
    const toggledState = updatedRowData[rowIndex].useYn === "1" ? "2" : "1";
    updatedRowData[rowIndex].useYn = toggledState;
    updatedRowData[rowIndex].__changed = true;

    setRowData(updatedRowData);
  };

  const handleUpdata = (key, value) => {
    console.log("key :::", key, "   value ::::: ", value);
    setSelectedCustomer({ ...selectedCustomer, [key]: value });
  };

  // 테이블 행 클릭 핸들러
  const handleTableRowClick = async (dataRow) => {
    try {
      console.log("formData:::", formData);
      const detailUrl = `${serverUrl}test/api/search/customer/detail`;
      const requestBody = { custCd: dataRow.custCd };

      const response = await fetch(detailUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("네트워크 응답이 올바르지 않습니다");
      }

      const result = await response.json();

      if (result.code === "0" && result.data) {
        console.log("result.data:::", result.data);
        setSelectedCustomer(result.data);
        setSelectedCustomer(dataRow);
      }
    } catch (error) {
      console.error("상세정보를 불러오는 중 오류 발생:", error);
    }
  };

  // 체크박스 상태 저장 함수
  const saveCheckboxState = async (custCd, useYn) => {
    try {
      const saveUrl = `${serverUrl}test/api/save/custUseYn`;

      const requestBody = {
        data: [],
      };

      const saveData = rowData
        .filter((row) => row.__changed)
        .map((row) => {
          delete row.calCd;
          delete row.custNm;
          delete row.regionCd;
          delete row.__changed;

          return row;
        });

      requestBody.data = saveData;

      const response = await fetch(saveUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("네트워크 응답이 올바르지 않습니다");
      }

      const result = await response.json();

      if (result.code === "0") {
        list();
      }
    } catch (error) {
      console.error("체크박스 상태 저장 중 오류:", error);
    }
  };

  // 입력 필드의 값이 변경될 때마다 호출되는 함수
  const handleInputChange = (event) => {
    if (event) {
      const { name, value } = event.target;
      setFormData({
        ...formData,
        [name]: value,
        // __changed: true,
      });

      return event.target.value;
    }
  };

  const handleAdd = () => {
    setSelectedCustomer({
      custCd: "",
      custNm: "",
      regionCd: "",
      calCd: "",
      shipmentYn: "N",
      telNo: "",
      faxNo: "",
      postNo: "",
      addStd: "",
      addDtl: "",
      manNm: "",
      manTelNo: "",
      invoiceMail: "",
      useYn: "1",
    });
  };

  // // 회원가입 양식 제출 처리
  // const handleAdd = async (e) => {
  //   e.preventDefault();
  //   const newErrors = {};

  //   // 유효성 검사
  //   if (formData.custNm.length === 0) {
  //     newErrors.custNm = "필수입력해야합니다";
  //   }
  //   setErrors(newErrors);

  //   if (Object.keys(newErrors).length === 0) {
  //     try {
  //       console.log("isReady:::", isReady);
  //       // Data를 불러온 상태일 때만 실행
  //       if (isReady) {
  //         // rowData에 새로운 행 추가
  //         setRowData((prevRowData) => [...prevRowData, formData]);

  //         // 서버에 데이터 저장
  //         const saveUrl = `${serverUrl}test/api/save/customer`;
  //         let addData;

  //         if (selectedCustomer) {
  //           // 기존 데이터가 있을 경우 (수정)
  //           addData = { ...formData, saveType: 2 };
  //         } else {
  //           // 기존 데이터가 없을 경우 (신규 등록)
  //           addData = { ...formData, saveType: 1 };
  //         }

  //         const requestBody = addData;

  //         const response = await fetch(saveUrl, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(requestBody),
  //         });

  //         if (!response.ok) {
  //           throw new Error("서버 응답이 올바르지 않습니다");
  //         }

  //         const result = await response.json();

  //         if (result.code === "0") {
  //           // 추가 후에 입력 폼 초기화
  //           setFormData({
  //             custCd: "",
  //             custNm: "",
  //             regionCd: "",
  //             calCd: "",
  //             shipmentYn: "",
  //             telNo: "",
  //             faxNo: "",
  //             postNo: "",
  //             addStd: "",
  //             addDtl: "",
  //             manNm: "",
  //             manTelNo: "",
  //             invoiceMail: "",
  //             useYn: "",
  //           });

  //           console.log("고객사가 추가되었습니다.");
  //           list(); // 테이블 갱신
  //         } else {
  //           console.error("고객사 추가 중 오류 발생:", result.message);
  //         }
  //       } else {
  //         alert("데이터를 불러온 다음 실행해 주세요!");
  //       }
  //     } catch (error) {
  //       console.error("고객사 추가 중 오류 발생:", error);
  //     }
  //   }
  // };

  // "저장" 버튼 클릭 시 실행되는 함수
  const handleCorrection = async () => {
    try {
      const saveUrl = `${serverUrl}test/api/save/customer`;

      // selectedCustomer({ useYn: 1 });

      let requestBody = {};
      console.log("저장저장:::", selectedCustomer);
      if (selectedCustomer.custCd) {
        // 기존 데이터가 있을 경우 (수정)
        requestBody = { ...selectedCustomer, saveType: 2 };
      } else {
        // 기존 데이터가 없을 경우 (신규 등록)
        requestBody = { ...selectedCustomer, saveType: 1 };
      }
      console.log("requestBody:::", requestBody);
      const response = await fetch(saveUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("서버 응답이 올바르지 않습니다");
      }

      const result = await response.json();
      console.log(result);
      if (result.code === "0") {
        setSelectedCustomer({ ...selectedCustomer, custCd: result.data });

        list(); // 테이블 갱신
      }
    } catch (error) {
      console.error("고객사 처리 중 오류 발생:", error);
    }
  };

  // 종료 버튼 클릭 핸들러
  const handleExitClick = () => {
    if (window.confirm("정말로 종료하시겠습니까?")) {
      window.close();
    }
  };

  const formControl = (event) => {
    event.preventDefault();

    console.log("event:::", event);
  };

  // 우편번호
  const completeHandler = (data) => {
    console.log(data);

    setSelectedCustomer({
      ...selectedCustomer,
      postNo: data.zonecode,
      addStd: data.roadAddress,
    });

    setIsOpen(false);
  };

  // Modal 스타일
  const customStyles = {
    overlay: {
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    content: {
      left: "0",
      margin: "auto",
      width: "500px",
      height: "600px",
      padding: "0",
      overflow: "hidden",
    },
  };

  // 포지셔닝
  const toggleActive = (e) => {
    setBtnActive((prev) => {
      return e.target.value;
    });
  };

  // 검색 클릭
  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="App">
      {/* 상단 바 */}
      <div className="first">
        <div className="first-1">비즈위즈시스템</div>
        <div className="first-2">
          <i
            className="fa-solid fa-circle-user"
            style={{ marginRight: "10px" }}
          ></i>
          안민별
          <i
            className="fa-solid fa-right-from-bracket"
            style={{ marginLeft: "60px", cursor: "pointer" }}
            onClick={handleExitClick}
          ></i>
        </div>
      </div>

      {/* 검색 및 조회 영역 */}
      <div className="second">
        <div
          className="second-1"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* 드롭다운 메뉴 */}
          <div
            className="dropdown"
            style={{ display: "inline-block", position: "relative" }}
          >
            <i
              className="fa-solid fa-bars"
              style={{ marginRight: "30px", cursor: "pointer" }}
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            ></i>
            {isDropdownOpen && (
              <div
                className="dropdown-content"
                style={{
                  position: "absolute",
                  backgroundcolor: "#f1f1f1",
                  minWidth: "160px",
                  boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.2)",
                  zIndex: 1,
                }}
              >
                <p style={{ padding: "12px 16px", margin: 0 }}>고객사 관리</p>
              </div>
            )}
          </div>
          {/* 고객사 관리 제목 */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginRight: "20px" }}>고객사 관리</div>
          </div>
        </div>
        {/* 조회 버튼 및 저장 버튼 */}
        <div className="second-2">
          <button className="second-button" onClick={handleSearchClick}>
            조회
          </button>
          <button
            className="second-button"
            onClick={() => {
              if (selectedCustomer) {
                saveCheckboxState(
                  selectedCustomer.custCd,
                  selectedCustomer.useYn
                );
              }
            }}
          >
            저장
          </button>
        </div>
      </div>

      {/* 검색 조건 입력 영역 */}
      <div className="third">
        <div className="third-box1">
          지역
          <select
            className="third-select"
            value={searchParams?.regionCd || ""}
            onChange={(e) =>
              handleSearchParamsChange("regionCd", e.target.value)
            }
          >
            <option value="">전체</option>
            {regionCd &&
              regionCd.map((col) => (
                <option value={col.typeCd} key={col.typeCd}>
                  {col.typeNm}
                </option>
              ))}
          </select>
        </div>
        <div className="third-box2">
          정산방법
          <select
            className="third-select"
            value={searchParams.calCd || ""}
            onChange={(e) => handleSearchParamsChange("calCd", e.target.value)}
          >
            <option value="">전체</option>
            {calCd &&
              calCd.map((col) => (
                <option value={col.typeCd} key={col.typeCd}>
                  {col.typeNm}
                </option>
              ))}
          </select>
        </div>
        <div className="third-input">
          고객사명
          <input
            type="text"
            placeholder="고객사명 입력"
            style={{ marginLeft: "10px", width: "15vw", height: "30px" }}
            onChange={(e) => handleSearchParamsChange("custNm", e.target.value)}
          />
        </div>
        <div className="third-box3">
          사용여부
          <select
            className="third-select"
            value={searchParams.useYn || ""}
            onChange={(e) => handleSearchParamsChange("useYn", e.target.value)}
          >
            <option value="">전체</option>
            {useYn &&
              useYn.map((col) => (
                <option value={col.typeCd} key={col.typeCd}>
                  {col.typeNm}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* 테이블 및 상세정보 영역 */}
      <div className="boxes">
        {/* 테이블 */}
        <div className="box1">
          <div className="box1-title">고객사 목록</div>
          <div>
            <table className="table-container">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.field}>{col.headerName}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ height: "60vh", border: "1px solid gray" }}>
                {rowData === null ? (
                  <tr>
                    <td colSpan={columns.length}>데이터가 없습니다.</td>
                  </tr>
                ) : (
                  rowData.map((dataRow, rowIndex) => {
                    return (
                      <tr
                        key={rowIndex}
                        onClick={() => handleTableRowClick(dataRow)}
                        style={{
                          cursor: "pointer",
                          background:
                            selectedCustomer.custCd === dataRow.custCd
                              ? "lightblue"
                              : "white",
                        }}
                      >
                        <td>{rowIndex + 1}</td>
                        <td>{dataRow.custCd}</td>
                        <td>{dataRow.custNm}</td>

                        <td>
                          {regionCd.map((item) => {
                            return item.typeCd === dataRow.regionCd
                              ? item.typeNm
                              : undefined;
                          })}
                        </td>
                        <td>
                          {calCd.map((item) => {
                            return item.typeCd === dataRow.calCd
                              ? item.typeNm
                              : undefined;
                          })}
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            id={`useYnCheckbox_${rowIndex}`}
                            checked={dataRow.useYn === "1"}
                            onChange={() => handleUseYnCheckboxChange(rowIndex)}
                            value={rowIndex}
                            className={
                              "btn" + (rowIndex === btnActive ? " active" : "")
                            }
                            onClick={toggleActive}
                          />
                          <label htmlFor={`useYnCheckbox_${rowIndex}`}>
                            {getUseText(parseInt(dataRow.useYn))}
                          </label>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="box2">
          <form
            // action={`${serverUrl}test/api/save/customer`}
            // method="POST"
            // name="formTagData"
            onSubmit={formControl}
          >
            <div className="box2-line">
              <div className="box2-title">고객사 상세정보</div>
              <div>
                <i
                  className="fa-solid fa-plus"
                  style={{ marginRight: "20px", cursor: "pointer" }}
                  onClick={handleAdd}
                ></i>
                <i
                  className="fa-regular fa-floppy-disk"
                  style={{ cursor: "pointer" }}
                  onClick={handleCorrection}
                ></i>
              </div>
            </div>
            {/*고객사 상세정보 */}
            <div className="user-information">
              {
                <>
                  <div className="user" style={{ marginTop: "10px" }}>
                    고객사코드
                    <input
                      type="text"
                      className="user-input"
                      backgroundcolor="#FFCCCC"
                      value={
                        selectedCustomer ? selectedCustomer.custCd : undefined
                      }
                      disabled // 수정 불가능하도록 설정
                      name="custCd"
                      required //필수입력
                    />
                  </div>
                  <div className="user">
                    고객사명
                    <input
                      type="text"
                      name="custNm"
                      placeholder="고객사명 입력"
                      className="user-input"
                      value={
                        selectedCustomer ? selectedCustomer.custNm : undefined
                      }
                      onChange={(e) => handleUpdata("custNm", e.target.value)}
                      required //필수입력
                    />
                  </div>
                  <div className="user">
                    지역
                    <select
                      className="user-select"
                      name="regionCd"
                      value={
                        selectedCustomer ? selectedCustomer.regionCd : undefined
                      }
                      onChange={(e) => handleUpdata("regionCd", e.target.value)}
                      required //필수입력
                    >
                      {/* 빈 기본 옵션 추가 */}
                      <option key="default-empty" hidden></option>
                      {regionCd &&
                        regionCd.map((col) => (
                          <option value={col.typeCd} key={col.typeCd}>
                            {col.typeNm}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="user">
                    정산방법
                    <select
                      name="calCd"
                      className="user-select"
                      value={
                        selectedCustomer ? selectedCustomer.calCd : undefined
                      }
                      onChange={(e) => handleUpdata("calCd", e.target.value)}
                      required //필수입력
                    >
                      {/* 빈 기본 옵션 추가 */}
                      <option key="default-empty" hidden></option>
                      {calCd &&
                        calCd.map((col) => (
                          <option value={col.typeCd} key={col.typeCd}>
                            {col.typeNm}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="user">
                    출하계획
                    <div
                      style={{
                        border: "1px solid black",
                        padding: "7px",
                        width: "300px",
                        backgroundColor: "#ffff",
                        display: "flex",
                        marginRight: "3vw",
                      }}
                    >
                      <div style={{ marginLeft: "50px", marginRight: "50px" }}>
                        <input
                          name="shipmentYn"
                          type="checkbox"
                          id="shipmentPlanCheckbox"
                          value={"Y"}
                          checked={
                            selectedCustomer
                              ? selectedCustomer.shipmentYn === "Y"
                                ? true
                                : false
                              : false
                          }
                          onChange={(e) =>
                            handleUpdata("shipmentYn", e.target.value)
                          }
                          required //필수입력
                        />
                        <label htmlFor="shipmentPlanCheckbox">사용</label>
                      </div>
                      <div>
                        <input
                          name="shipmentYn"
                          type="checkbox"
                          id="noShipmentPlanCheckbox"
                          value={"N"}
                          checked={
                            selectedCustomer
                              ? selectedCustomer.shipmentYn === "Y"
                                ? false
                                : true
                              : false
                          }
                          onChange={(e) =>
                            handleUpdata("shipmentYn", e.target.value)
                          }
                        />
                        <label htmlFor="noShipmentPlanCheckbox">미사용</label>
                      </div>
                    </div>
                  </div>
                  <div className="user">
                    전화번호
                    <input
                      name="telNo"
                      type="tel"
                      placeholder="전화번호 입력 (예: 010-1234-5678)"
                      maxLength="13"
                      className="user-input"
                      value={
                        selectedCustomer ? selectedCustomer.telNo : undefined
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(
                          /(\d{3})(\d{4})(\d{4})/,
                          "$1-$2-$3"
                        );
                        handleUpdata("telNo", value);
                      }}
                    />
                  </div>
                  <div className="user">
                    팩스번호
                    <input
                      name="faxNo"
                      type="tel"
                      placeholder="팩스번호 입력"
                      className="user-input"
                      value={
                        selectedCustomer ? selectedCustomer.faxNo : undefined
                      }
                      onChange={(e) => handleUpdata("faxNo", e.target.value)}
                    />
                  </div>
                  <div className="user">
                    우편번호
                    <input
                      name="postNo"
                      type="tel"
                      placeholder="우편번호 입력"
                      className="user-input"
                      maxLength="5"
                      style={{ position: "relative" }}
                      value={
                        selectedCustomer ? selectedCustomer.postNo : undefined
                      }
                      onChange={(e) => handleUpdata("postNo", e.target.value)}
                      readOnly
                    />
                    <i
                      className="fa-solid fa-magnifying-glass"
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        right: "150px",
                      }}
                      onClick={toggle}
                    ></i>
                  </div>
                  <div className="user">
                    기본주소
                    <input
                      name="addStd"
                      type="text"
                      placeholder="기본주소 입력"
                      className="user-input"
                      value={
                        selectedCustomer ? selectedCustomer.addStd : undefined
                      }
                      onChange={(e) => handleUpdata("addStd", e.target.value)}
                      readOnly
                    />
                  </div>
                  <div className="user">
                    상세주소
                    <input
                      name="addDtl"
                      type="text"
                      placeholder="상세주소 입력"
                      className="user-input"
                      value={
                        selectedCustomer ? selectedCustomer.addDtl : undefined
                      }
                      onChange={(e) => handleUpdata("addDtl", e.target.value)}
                    />
                  </div>
                  <div className="user">
                    담당자
                    <input
                      name="manNm"
                      type="text"
                      placeholder="담당자 성함 입력"
                      className="user-input"
                      value={
                        selectedCustomer ? selectedCustomer.manNm : undefined
                      }
                      onChange={(e) => handleUpdata("manNm", e.target.value)}
                    />
                  </div>
                  <div className="user">
                    담당자연락처
                    <input
                      name="manTelNo"
                      type="tel"
                      placeholder="담당자 연락처 입력(예: 010-1234-5678)"
                      className="user-input"
                      pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}"
                      maxLength="13"
                      value={
                        selectedCustomer ? selectedCustomer.manTelNo : undefined
                      }
                      onChange={(e) => handleUpdata("manTelNo", e.target.value)}
                    />
                  </div>
                  <div className="user">
                    계산서수취메일
                    <input
                      type="text"
                      name="invoiceMail"
                      placeholder="계산서수취메일 입력"
                      className="user-input"
                      value={
                        selectedCustomer
                          ? selectedCustomer.invoiceMail
                          : undefined
                      }
                      onChange={(e) =>
                        handleUpdata("invoiceMail", e.target.value)
                      }
                    />
                  </div>

                  {/* <div>
                    <input value={zipCode} readOnly placeholder="우편번호" />
                    <button onClick={toggle}>우편번호 검색</button>
                    <br />
                    <input
                      value={roadAddress}
                      readOnly
                      placeholder="도로명 주소"
                    />
                    <br /> */}
                  <Modal
                    isOpen={isOpen}
                    ariaHideApp={false}
                    style={customStyles}
                  >
                    <DaumPostcode onComplete={completeHandler} height="100%" />
                  </Modal>
                  {/* <input
                      type="text"
                      onChange={changeHandler}
                      value={detailAddress}
                      placeholder="상세주소"
                    />
                    <button onClick={clickHandler}>클릭</button>
                    <br />
                  </div> */}
                </>
              }
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Main;
