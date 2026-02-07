// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()


let memberCount = 1;

function addMember() {
  const container = document.getElementById("membersContainer");

  const div = document.createElement("div");
  div.className = "member-form";

  div.innerHTML = `
       <label for="">Management Member Details Form No ${memberCount + 1}  :</label>
          <div class="col-md-6">
            <label for="Role" class="form-label">his/her Role in Institute : </label>
            <input type="text" class="form-control" id="inputCity" placeholder="eg : Chairman , Principal" name="member[${memberCount}][Role]" required>
            <div class="invalid-feedback">
              Please enter the role...!!
            </div>
          </div>
          <div class="inline-2">
            <div class="col-md-6">
              <label for="Name" class="form-label">Name :</label>
              <input type="text" class="form-control" id="inputCity" placeholder="Enter Name" name="member[${memberCount}][Name]" required>
              <div class="invalid-feedback">
                plz Enter the name of the Management Member...
              </div>
            </div>
            <div class="col-md-1">
              <label for="age" class="form-label">Age :</label>
              <input type="text" class="form-control" id="inputCity" placeholder="Age" name="member[${memberCount}][age]" required>
              <div class="invalid-feedback">
                plz Enter the age..
              </div>
            </div>
            <div class="col-md-2">
              <label for="gender" style="margin-bottom: 10px;">Gender :</label>
              <select class="form-select" aria-label="Default select example" name = 'member[${memberCount}][Gender]'>
                <option selected>Gender</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
                <option value="3">Other..</option>
              </select>
            </div>
          </div>
          <div class="inline-2">
            <div class="col-md-8">
              <label for="Qualification" class="form-label">Qualification/Achievement :</label>
              <input type="text" class="form-control" id="inputCity" placeholder="eg : B.tech in Computer Science" name="member[${memberCount}][Qualification]" required>
              <div class="invalid-feedback">
                Plz Enter The Qualification or achievement..
              </div>
            </div>
            <div class="Institute">
              <label for="photo" style="margin-bottom: 15px;"><b>Upload A Photo :</b></label>
              <div class="input-group ">
                <input type="file" class="form-control" id="inputGroupFile02" name="member[${memberCount}][photo.url]" accept=".jpg , .png , .webp">
                <div class="invalid-feedback">
                  please upload a valid photo in jpg/png/webp
                </div>
              </div>
            </div>
          </div>
        
         
      `;

  container.appendChild(div);
  memberCount++;
}


let memberCount2 = 1;

function addMember2() {
  const container = document.getElementById("membersContainer2");

  const div = document.createElement("div");
  div.className = "member-form2";

  div.innerHTML = `
        <label for="">Enter Details of event No. ${memberCount2 + 1} :</label>

          <div class="mb-3">
            <label for="Name" class="form-label">Event Name :</label>
            <input type="text" class="form-control" id="inputCity" placeholder="eg : Paricharcha etc" name="event[${memberCount2}][Name]" required>
            <div class="invalid-feedback">
              plz Enter the name of the event...
            </div>
          </div>
          <div class="mb-3">
            <label for="purpose" class="form-label">Event Purpose :</label>
            <input type="text" class="form-control" id="inputCity" placeholder="eg : Annual Sports Event" name="event[${memberCount2}][purpose]" required>
            <div class="invalid-feedback">
              plz Enter the name of the event...
            </div>
          </div>

          <label style="margin-bottom: 15px;">Describe the Event (4 to 5 lines):</label>

          <textarea name="event[${memberCount2}][about]" placeholder="" style="height: 100px; width: 100%; border: 2px solid white; border-radius: 10px;"></textarea>

          <div class="Institute">
              <label for="photo" style="margin-bottom: 15px;"><b>Upload Primary Photo Of the event :</b></label>
              <div class="input-group ">
                <input type="file" class="form-control" id="inputGroupFile02" name="event[${memberCount2}][primaryPhoto.url]" accept=".jpg , .png , .webp">
                <div class="invalid-feedback">
                  please upload a valid photo in jpg/png/webp
                </div>
              </div>
            </div>
           <div class="Institute">
              <label for="photo" style="margin-bottom: 15px;"><b>Upload Secondary Photo Of the event :</b></label>
              <div class="input-group ">
                <input type="file" class="form-control" id="inputGroupFile02" name="event[${memberCount2}][secondaryPhoto.url]" accept=".jpg , .png , .webp">
                <div class="invalid-feedback">
                  please upload a valid photo in jpg/png/webp
                </div>
              </div>
            </div>
      `;

  container.appendChild(div);
  memberCount++;
}